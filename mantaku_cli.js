const {input, select, Separator, checkbox, rawlist} = require('@inquirer/prompts');
const {Mantaku} = require('./mantaku');
const {Librarian, Manga} = require('./librarian');
const cliProgress = require('cli-progress');
const fs = require('fs-extra');
const {TaskManager} = require('./task');
const tableSelect = require('./table_select').default;
require('json5/lib/register')
const SETTING_PATH = './setting.json5';

function banner() {
    console.log(`                                                  
         _/      _/                    _/              _/   _/              
        _/_/  _/_/   _/_/_/ _/_/_/  _/_/_/_/   _/_/_/ _/  _/   _/    _/   
       _/  _/  _/ _/    _/ _/    _/  _/     _/    _/ _/_/     _/    _/    
      _/      _/ _/    _/ _/    _/  _/     _/    _/ _/  _/   _/    _/     
     _/      _/   _/_/_/ _/    _/    _/_/   _/_/_/ _/    _/   _/_/_/          
`)
}

let mantaku = null;
let librarian = null;
let setting = null;

function twirlTimer(str) {
    const icon = ['⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + icon[x++] + str);
      x %= icon.length;
    }, 200);}
let loading = null;
function startLoading() {
    loading = twirlTimer(' 读取中...');
}

function stopLoading() {
    clearInterval(loading);
    process.stdout.write("\r");
}

async function main() {
    banner();
    if (!await fs.exists('./librarian.json5')) { // init librarian json
        await fs.writeFile('./librarian.json5', '{}');
    }
    if (!await fs.exists(SETTING_PATH)) {
        await fs.copyFile('./setting-sample.json5', SETTING_PATH);
    }
    setting = require(SETTING_PATH);
    
    mantaku = new Mantaku();
    librarian = new Librarian('./');
    let puppeteerOpts = setting.debugMode? {
        headless: false, slowMo: 200, devtools:true
    }:{};
    await mantaku.init({
        usePuppeteer: true,
        puppeteerOpts,
    });
    await home();
}

async function home() {
    
    const op1 = await select({
        message: '欢迎使用Mantaku,请选择(随时用Ctrl+C退出)',
        choices: [
          {name: '搜索', value: 'search',},
          {name: '设置',value: 'setting',},
          {name: '退出', value: 'quit',},
        ],
    });
    
    switch(op1) {
        case 'quit':
            process.exit(0);
        case 'sites':
            let sites = mantaku.listSites();
            console.table(sites);
            await home();
            break;
        case 'search':
            await search();
            break;
        case 'setting':
            await goSetting();
            break;
    }
}

async function search() {
    let site = await select({
        message: '选择搜索的站点',
        choices: mantaku.listSites().map((m) => {
            return {name: m.name, value: m.id, description: m.home};
        }),
    });
    const keyword = await input({ message: '输入关键字:',});
    startLoading();
    let page = await mantaku.newBrowserPage();
    let list = await mantaku.search(page, site, keyword);
    stopLoading();
    if (list.length <= 0) {
        console.log('未搜索到结果');
        process.exit();
    }
    let choices = list.map((m) => {
        return {name: m.title + (m.author?`(${m.author})`:''), value: m.url, description: m.url};
    });
    const op2 = await select({
        message: '选择搜索结果',
        choices: choices,
    });
    await showManga(op2);
}

async function showManga(url) {
    let page = await mantaku.newBrowserPage();
    await page.goto(url);
    let mangaInfo = await mantaku.browseManga(page);
    console.log(`标题: ${mangaInfo.title}`);
    console.log(`作者: ${mangaInfo.author}`);
    console.log(`介绍: ${mangaInfo.intro}`);
    console.log(`状态: ${mangaInfo.status}`);

    // TODO: combine with librarian
    let choices = mangaInfo.chapters.map((m, i) => {
        return {name: m.title, value: m, description: m.url, /*checked: true*/};
    });
    // const selectedChapters = await checkbox({ // todo: use widther prompt
    //     message: 'Select chapters to download',
    //     choices: choices,
    //     pageSize: 20
    // });

    const selectedChapters = await tableSelect({
        message: '请选择需要下载的章节',
        choices: choices,
        // pageSize: 20
        column: 6,
        loop: false,
        instructions: '(空格选择，回车确认, a: 全选, i: 反选, c: 多选至上一个已选择)',
    });

    //TODO: librarian check is download before and hint download folder
    let manga = await librarian.findManga(url);
    if (!manga) {
        // ask for download path
        // await askDownloadPath();
        // create path and record manga info
        //TODO: librarian record skip chapters
    }

    let path = "test";

    await downloadChapters(path, selectedChapters);
}

async function downloadChapters(path, chapters) {
    let taskManager = new TaskManager({
        concurrency: 2,
        path: path,
        pages: [await mantaku.newBrowserPage(), await mantaku.newBrowserPage()]
    });
    taskManager.addChapter(chapters);

    // create new container
    const multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: ' {bar} | {title} | {value}/{total} | ETA: {eta}s',
    }, cliProgress.Presets.legacy);

    // for(let i = 0; i < taskManager.concurrency; i++) {
    //     multibar.create(100, 0);
    // }

    taskManager.on('worker_start', (worker_index) => {
        // console.log('debug worker start event', worker_index);
        multibar.create(100, 0);
    });

    taskManager.on('worker_progress', (worker_index, task, index, total) => {
        let b = multibar.bars[worker_index];
        b.total = total;
        b.update(index, {title: task.title});
    });
    
    taskManager.on('worker_done', (worker_index) => {
        // console.log('debug worker done event', worker_index);
        // multibar.bars[worker_index].stop();
        // multibar.remove(multibar.bars[worker_index]);
        if (multibar.bars.length <= 0) {
            multibar.stop();
            console.log('All tasks were done');
            home();
        }
    });
    taskManager.start();
}

async function goSetting() {
    for(let key in setting) {
        let value = await input({ message: `键:${key} ->`, default: setting[key] });
        setting[key] = value;
    }
    console.log('设置已保存');
    await fs.writeFile(SETTING_PATH, JSON.stringify(setting, null, 4));
    await home();
}

main();