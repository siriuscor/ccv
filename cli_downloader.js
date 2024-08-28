const {input, select, Separator, checkbox, rawlist} = require('@inquirer/prompts');
const {Mantaku} = require('./mantaku');
const {Librarian, Manga} = require('./librarian');
const cliProgress = require('cli-progress');
const fs = require('fs-extra');
const {TaskManager} = require('./task');

require('json5/lib/register')
// const setting = require('./setting.json5');

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

function twirlTimer() {
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + P[x++]);
      x &= 3;
    }, 250);
}
let loading = null;
function startLoading() {
    loading = twirlTimer();
}

function stopLoading() {
    clearInterval(loading);
}

async function main() {
    banner();
    if (!await fs.exists('./librarian.json5')) { // init librarian json
        await fs.writeFile('./librarian.json5', '{}');
    }
    if (!await fs.exists('./setting.json5')) {
        await initSetting();
    }
    mantaku = new Mantaku();
    librarian = new Librarian('./');
    
    await mantaku.init({
        usePuppeteer: true,
        // puppeteerOpts: {
        //     headless: true,
        //     // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        // }
    });
    await home();
}

async function home() {
    const op1 = await select({
        message: 'Select an option',
        choices: [
          {name: 'Search Manga', value: 'search',},
        //   {name: 'Supported Sites', value: 'sites',},
          {name: 'Settings',value: 'setting',},
          {name: 'Quit', value: 'quit',},
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
            await setting();
            break;
    }
}

async function search() {
    let site = await select({
        message: 'Select a site',
        choices: mantaku.listSites().map((m) => {
            return {name: m.name, value: m.name, description: m.home};
        }),
    });
    const keyword = await input({ message: 'Enter keyword:' });
    startLoading();
    let page = await mantaku.newBrowserPage();
    let list = await mantaku.search(page, site, keyword);
    let choices = list.map((m) => {
        return {name: m.title + (m.author?`(${m.author})`:''), value: m.url, description: m.url};
    });
    stopLoading();
    const op2 = await select({
        message: 'Select a manga',
        choices: choices,
    });
    // console.log(op2);
    await showManga(op2);
}

async function showManga(url) {
    let page = await mantaku.newBrowserPage();
    await page.goto(url);
    let mangaInfo = await mantaku.browseManga(page);
    console.log(`Title: ${mangaInfo.title}`);
    console.log(`Author: ${mangaInfo.author}`);
    console.log(`Intro: ${mangaInfo.intro}`);
    console.log(`Status: ${mangaInfo.status}`);

    // TODO: combine with librarian
    let choices = mangaInfo.chapters.map((m, i) => {
        return {name: m.title, value: m, description: m.url, /*checked: true*/};
    });
    const selectedChapters = await checkbox({ // todo: use widther prompt
        message: 'Select chapters to download',
        choices: choices,
        pageSize: 20
    });
    // console.log(selectedChapters);

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

async function initSetting() {

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

async function setting() {

}

main();