const {input, select, Separator, checkbox, rawlist, confirm} = require('@inquirer/prompts');
const {ExitPromptError} = require('@inquirer/core');
const {Mantaku} = require('./mantaku');
const {Librarian, Manga} = require('./librarian');
const cliProgress = require('cli-progress');
const p = require('path');
const fs = require('fs-extra');
const {TaskManager} = require('./task');
const tableSelect = require('./table_select').default;
const utils = require('./utils');
const settingHelper = require('./setting');
const { exec } = require('child_process');

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
    setting = await settingHelper.get();
    if (!setting) {
        setting = await initSetting();
    } else if (!await settingHelper.check(setting)) {
        setting = await initSetting('设置校验错误,请重新设置');
    }
    
    librarian = new Librarian(setting.basePath);
    await librarian.init();

    mantaku = new Mantaku();
    let puppeteerOpts = setting.debugMode? {
        headless: false, slowMo: 200, devtools:true,
        executablePath: setting.chromePath,
    }:{executablePath: setting.chromePath,};
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
        case 'library':
            await library();
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
    let downloaded = [];
    if (manga) {
        downloaded = manga.downloaded;
    }
    // const skipMark = '⤾';
    // const existMark = '✓';
    let choices = mangaInfo.chapters.map((m, i) => {
        let check = downloaded.includes(m.title);
        return {name: (check?'✓ ':'') + m.title, value: m, description: m.url, disabled:check /*checked: true*/};
    });

    if (choices.filter((c) => !c.disabled).length <= 0) {
        console.log('所有章节已下载');
        await home();
        return;
    }

    const selectedChapters = await tableSelect({
        message: '请选择需要下载的章节',
        choices: choices,
        // pageSize: 20
        column: 6,
        loop: false,
        instructions: '(空格选择, 回车确认, a: 全选, i: 反选, c: 多选至上一个已选择)',
    });
    let title = mangaInfo.title;
    if (!manga) {
        title = await input({ message: `新漫画,请输入下载目录`, default: title });
        manga = await librarian.addManga(title, mangaInfo);
    }
    // let path = manga.path;
    // await librarian.saveSkipChapters(manga, selectedChapters);
    await downloadChapters(p.resolve(setting.basePath, title), selectedChapters);
}

async function downloadChapters(path, chapters) {
    let con = parseInt(setting.concurrency) || 2;
    let pages = [];
    for(let i = 0; i < con; i++) {
        pages.push(await mantaku.newBrowserPage());
    }
    let taskManager = new TaskManager({
        concurrency: con,
        path: path,
        pages,
    });
    taskManager.addChapter(chapters);

    const multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: ' {bar} | {title} | {value}/{total} | ETA: {eta}s',
    }, cliProgress.Presets.legacy);

    taskManager.on('worker_start', (worker_index) => {
        // console.log('debug worker start event', worker_index);
        let bar = multibar.create(100, 0);
        bar.worker_index = worker_index;
    });

    taskManager.on('worker_progress', (worker_index, task, index, total) => {
        // let b = multibar.bars[worker_index];
        let b = multibar.bars.filter((b) => b.worker_index === worker_index)[0];
        b.total = total;
        b.update(index, {title: task.title});
    });
    
    taskManager.on('worker_done', (worker_index) => {
        let bar = multibar.bars.filter((b) => b.worker_index === worker_index);
        if (bar.length > 0) multibar.remove(bar[0]);
        if (multibar.bars.length <= 0) {
            multibar.stop();
            console.log(`下载已完成,路径为${path},欢迎下次使用`);
            process.exit();
        }
    });
    taskManager.start();
}

async function library() {
    let mangas = await librarian.getAllManga();
    let choices = [];
    for(let title in mangas) {
        let m = mangas[title];
        choices.push({name: `${m.title} - ${m.author}(${p.resolve(setting.basePath, title)})`, value: m.url});
    };
    if (choices.length <= 0) {
        console.log('书库为空');
        await home();
        return;
    }
    const op2 = await select({
        message: '选择漫画',
        choices: choices,
    });
    await showManga(op2);
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
    process.exit();
}

async function askSetting(key) {
    let value;
    if (typeof setting[key] === 'boolean') {
        value = await confirm({ message: `${settingPrompt[key]} :`, default: setting[key] });
    } else {
        value = await input({ message: `${settingPrompt[key]} :`, default: setting[key] });
    }
    setting[key] = value;
    await settingHelper.set(setting);
}

async function initSetting(msg) {
    console.log(msg || '首次进入,请初始化设置');
    let basePath = await input({ message: '下载书库路径,不存在将新建:', default: utils.getDefaultBasePath(),
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
    basePath = p.resolve(basePath);
    let chromePath = await input({ message: '本工具需要使用Chrome,请输入Chrome路径:', default: utils.getDefaultChromePath(), 
        validate: async (value) => {
            if (!value) return '请填写Chrome路径';
            if (!(await fs.exists(value))) return '路径无效';
            return true;
        },
    });
    let s = await settingHelper.set({basePath, chromePath});
    console.log('初始化设置完成,之后可以在设置中更改');
    return s;
}

main().catch(e => {
    if(e instanceof ExitPromptError) {
        console.log('再见');
        process.exit();
    } else {
        console.log('意外退出, 错误为', e);
    }
});