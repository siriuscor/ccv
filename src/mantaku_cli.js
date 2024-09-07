const {input, select, confirm} = require('@inquirer/prompts');
const {ExitPromptError} = require('@inquirer/core');
const {Mantaku} = require('./mantaku');
const {Librarian} = require('./librarian');
const cliProgress = require('cli-progress');
const p = require('path');
const fs = require('fs-extra');
const {TaskManager} = require('./task');
const tableSelect = require('./table_select').default;
const utils = require('./utils');
const settingHelper = require('./setting');
// const VERSION = require('../package.json').version;

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
    // const {EPub} = await import("@lesjoursfr/html-to-epub");
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
        headless: false, slowMo: 200, 
        devtools:true,
        executablePath: setting.chromePath,
    }:{executablePath: setting.chromePath,};
    await mantaku.init({
        usePuppeteer: true,
        puppeteerOpts,
    });
    await home();
}

async function home() {
    let VERSION = await utils.readVersion();
    const op1 = await select({
        message: `欢迎使用Mantaku v${VERSION},请选择(随时用Ctrl+C退出)`,
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
            // 
            break;
        case 'search':
            await search();
            break;
        case 'setting':
            await goSetting();
            await home();
            break;
    }
    await home();
}

let currentSiteID = null;
async function search() {
    let site = await select({
        message: '选择搜索的站点',
        choices: mantaku.listSites().map((m) => {
            return {name: m.name, value: m.id, description: m.home};
        }),
    });
    currentSiteID = site;
    const keyword = await input({ message: '输入关键字:',});
    utils.startLoading();
    let page = await mantaku.newBrowserPage();
    let list = await mantaku.search(page, site, keyword);
    utils.stopLoading();
    if (list.length <= 0) {
        console.log('未搜索到结果');
        return;
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
    utils.startLoading();
    let page = await mantaku.newBrowserPage();
    await utils.retry(page.goto.bind(page), url);
    let mangaInfo = await mantaku.browseManga(page);
    utils.stopLoading();
    console.log(`标题: ${mangaInfo.title}`);
    console.log(`作者: ${mangaInfo.author}`);
    console.log(`介绍: ${mangaInfo.intro}`);
    console.log(`状态: ${mangaInfo.status}`);
    mangaInfo.url = url;

    if (mangaInfo.chapters.length <= 0) {
        console.log('未找到章节');
        return;
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
        return;
    }

    const selectedChapters = await tableSelect({
        message: '请选择需要下载的章节',
        choices: choices,
        // pageSize: 20
        column: 5,
        loop: false,
        instructions: '(空格选择, 回车确认, a: 全选, i: 反选, c: 多选至上一个已选择)',
    });

    if (selectedChapters.length <= 0) {
        console.log('未选择章节');
        return;
    }
    let title = mangaInfo.title;
    if (!manga) {
        title = await input({ message: `新漫画,请输入下载目录`, default: `${title}(${currentSiteID})` });
        manga = await librarian.addManga(title, mangaInfo);
    }
    // let path = manga.path;
    // await librarian.saveSkipChapters(manga, selectedChapters);
    await downloadChapters(librarian.getMangePath(manga.key), selectedChapters, manga);
}

async function downloadChapters(path, chapters, manga) {
    let con = parseInt(setting.concurrency) || 2;
    con = Math.min(con, chapters.length);
    if (setting.debugMode) con = 1;
    let pages = [];
    for(let i = 0; i < con; i++) {
        pages.push(await mantaku.newBrowserPage());
    }
    let taskManager = new TaskManager({
        concurrency: con,
        path: path,
        pages,
    });
    taskManager.addChapter(chapters, setting.ext, manga);

    return new Promise((resolve, reject) => {
        const multibar = new cliProgress.MultiBar({
            clearOnComplete: false,
            hideCursor: true,
            barCompleteChar: '=',
            barIncompleteChar: '.',
            format: ' [{bar}] | {title} | {value}/{total} | ETA: {eta}s',
        }, cliProgress.Presets.legacy);

        taskManager.on('worker_start', (worker_index) => {
            let bar = multibar.create(100, 0);
            bar.worker_index = worker_index;
        });

        taskManager.on('worker_progress', (worker_index, task, index, total) => {
            let b = multibar.bars.filter((b) => b.worker_index === worker_index)[0];
            b.total = total;
            b.update(index, {title: task.title});
        });
        
        taskManager.on('worker_done', (worker_index) => {
            let bar = multibar.bars.filter((b) => b.worker_index === worker_index);
            if (bar.length > 0) multibar.remove(bar[0]);
            if (multibar.bars.length <= 0) {
                multibar.stop();
                console.log(`下载已完成,路径为${path}`);

                //TODO: close browser tab
                resolve();
            }
        });
        taskManager.start();
    });
}

async function library() {
    let mangas = await librarian.getAllManga();
    let list = Object.values(mangas).sort((a, b) => {
        return a.lastOpen > b.lastOpen? -1 : 1;
    });
    let choices = list.map((m) => {
        return {name: `${m.title} - ${m.author}(${librarian.getMangePath(m.key)})`, value: m};
    });
    if (choices.length <= 0) {
        console.log('书库为空');
        return;
    }
    const manga = await select({
        message: '选择漫画',
        choices: choices,
    });

    await librarian.updateManga(manga.key); // use for sort

    const op3 = await select({
        message: `对于 <${manga.title}> 选择一个操作`,
        choices: [
          {name: '查看漫画章节',value: 'show',},
          {name: '删除漫画记录(不删除文件)',value: 'delete',},
          {name: '返回上一级',value: 'back',},
        ],
      });

    switch(op3) {
        case 'show':
            await showManga(manga.url);
            break;
        case 'delete':
            await librarian.deleteManga(manga.key);
            console.log('已删除');
            await library();
            break;
        case 'back':
            await library();
            break;
    }
}

const settingPrompt = {
    concurrency: '并发下载数量',
    basePath: '下载书库路径',
    chromePath: 'Chrome路径',
    debugMode: '调试模式(需重启生效)',
    ext: '打包格式',
};

async function goSetting() {
    for(let key in setting) {
        await askSetting(key);
    }
    console.log('设置已保存');
}

async function askSetting(key) {
    let value;
    if (typeof setting[key] === 'boolean') {
        value = await confirm({ message: `${settingPrompt[key]} :`, default: setting[key] });
    } else if (key === 'ext') {
        value = await select({ message: `${settingPrompt[key]} :`, choices: [
            {name: 'zip', value: 'zip'},
            {name: 'cbz', value: 'cbz'},
            {name: 'epub', value: 'epub'},
        ], default: setting[key] });
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
    } else {
        console.log('意外退出, 错误为', e);
    }
    process.exit();
});