const {input, select, Separator, checkbox, rawlist, confirm} = require('@inquirer/prompts');
const {Mantaku} = require('./mantaku');
const {Librarian, Manga} = require('./librarian');
const cliProgress = require('cli-progress');
const p = require('path');
const fs = require('fs-extra');
const {TaskManager} = require('./task');
const tableSelect = require('./table_select').default;
const utils = require('./utils');

const SETTING_PATH = './setting.json';

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

async function main() {
    banner();
    if (!await fs.exists(SETTING_PATH)) {
        await initSetting();
    }
    setting = require(SETTING_PATH);
    
    librarian = new Librarian(setting.basePath);
    await librarian.init();

    mantaku = new Mantaku();
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
          {name: '书库', value: 'library',},
          {name: '设置',value: 'setting',},
          {name: '退出', value: 'quit',},
        ],
    });
    
    switch(op1) {
        case 'quit':
            process.exit(0);
        // case 'sites':
        //     let sites = mantaku.listSites();
        //     console.table(sites);
        //     await home();
        //     break;
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
    utils.startLoading();
    let page = await mantaku.newBrowserPage();
    let list = await mantaku.search(page, site, keyword);
    utils.stopLoading();
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
    mangaInfo.url = url;

    if (mangaInfo.chapters.length <= 0) {
        console.log('未找到章节');
        process.exit();
    }

    let manga = await librarian.findManga(url);
    if (manga) {
    }

    const skipMark = '⤾';
    const existMark = '✓';
    // TODO: combine with librarian
    let choices = mangaInfo.chapters.map((m, i) => {
        return {name: m.title, value: m, description: m.url, /*checked: true*/};
    });

    const selectedChapters = await tableSelect({
        message: '请选择需要下载的章节',
        choices: choices,
        // pageSize: 20
        column: 6,
        loop: false,
        instructions: '(空格选择, 回车确认, a: 全选, i: 反选, c: 多选至上一个已选择)',
    });

    //TODO: librarian check is download before and hint download folder
    
    let title = mangaInfo.title;
    if (!manga) {
        title = await input({ message: `新漫画,请输入下载目录`, default: title });
        manga = await librarian.addManga(title, mangaInfo);
        //TODO: librarian record skip chapters
    }
    let path = manga.path;
    await librarian.saveSkipChapters(manga, selectedChapters);
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
        let bar = multibar.create(100, 0);
        bar.worker_index = worker_index;
    });

    taskManager.on('worker_progress', (worker_index, task, index, total) => {
        let b = multibar.bars[worker_index];
        b.total = total;
        b.update(index, {title: task.title});
    });
    
    taskManager.on('worker_done', (worker_index) => {
        let bar = multibar.bars.filter((b) => b.worker_index === worker_index);
        if (bar.length > 0) multibar.remove(bar[0]);
        if (multibar.bars.length <= 0) {
            multibar.stop();
            console.log(`下载已完成,路径为${path},欢迎继续使用`);
            process.exit();
        }
    });
    taskManager.start();
}

const settingPrompt = {
    concurrency: '并发下载数量',
    basePath: '下载书库路径',
    chromePath: 'Chrome路径',
    debugMode: '调试模式',
};

async function goSetting() {
    for(let key in setting) {
        await askSetting(key);
    }
    console.log('设置已保存');
    await fs.writeFile(SETTING_PATH, JSON.stringify(setting, null, 4));
    // await home();
}

async function askSetting(key) {
    let value;
    if (typeof setting[key] === 'boolean') {
        value = await confirm({ message: `${settingPrompt[key]} :`, default: setting[key] });
    } else {
        value = await input({ message: `${settingPrompt[key]} :`, default: setting[key] });
    }
    setting[key] = value;
    await fs.writeFile(SETTING_PATH, JSON.stringify(setting, null, 4));
}

async function initSetting() {
    console.log('首次进入,请初始化设置');
    let init = {};
    init.basePath = await input({ message: '下载书库路径,不存在将新建:', default: utils.getDefaultBasePath(),
        validate: async (value) => {
            if (!value) return '请填写下载路径';
            try {
                value = p.resolve(value);
                if (!(await fs.exists(value))) {
                    await fs.mkdirp(value);
                }
            } catch(e) {
                return '路径无效或无法创建';
            }
            return true;
        },
    });
    init.basePath = p.resolve(init.basePath);
    init.chromePath = await input({ message: '本工具需要使用Chrome,请输入Chrome路径:', default: utils.getDefaultChromePath(), 
        validate: async (value) => {
            if (!value) return '请填写Chrome路径';
            if (!(await fs.exists(value))) return '路径无效';
            return true;
        },
    });
    init = {...require('./setting-sample.json'), ...init};
    await fs.writeFile(SETTING_PATH, JSON.stringify(init, null, 4));
    console.log('初始化设置完成,之后可以在设置中更改');
}

main();