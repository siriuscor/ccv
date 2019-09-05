const puppeteer = require('puppeteer');
const {URL} = require('url');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const plugins = require('./plugins');
const cp = require('child_process');
// chapter list https://manhua.fzdm.com/3/
// detail https://manhua.fzdm.com/3/Vol_001/

var comicUrl = 'https://manhua.fzdm.com/3/Vol_001/';
comicUrl = 'https://manhua.fzdm.com/3/';
comicUrl = 'https://manhua.fzdm.com/41/';
comicUrl = 'https://www.manhuafen11.com/comic/2314/';
comicUrl = 'https://tw.manhuagui.com/comic/20200/';
var chapterUrl = 'https://tw.manhuagui.com/comic/20200/277805.html';

var zipPath = process.cwd();
var info = console.log;
var debug = console.log;

class Comtaku {
    constructor() {
        this.imageCache = {};
    }
    async openBrowser(opts) {
        this.browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
    }

    async browseComic(url, opts={}) {
        let plugin = this.loadPlugin(url, opts);
        let page = await this.browser.newPage();
        await plugin.init(page);
        await plugin.goto(page, url);
        let chapters = await plugin.findChapters(page);
        info(`FOUND ${chapters.length} Chapters`);
        let workerNumber = opts.worker || 2;
        let worker = new Array(workerNumber).fill(0);
        let index = 0;
        await Promise.all(worker.map(async item => {
            while(chapters[index]) await this.browseChapter(chapters[index++], opts);
        }));
    }

    async browseChapter(url, opts={}) {
        let title = null;
        if (typeof url == 'object') {
            let chapterInfo = url;
            url = chapterInfo.url;
            title = chapterInfo.name;
        }
        if (await this.isDownloaded(title)) {
            info(`${title} exists, skip download`);
            return;
        }
        info(`BEGIN Browse ${title} at ${url}`);
        let browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
        let plugin = this.loadPlugin(url, opts);
        let page = await browser.newPage();
        await plugin.init(page);
        let dir = await fs.mkdtemp(os.tmpdir());
        let index = 1;
        await plugin.goto(page, url);
        if (!title) title = await plugin.findTitle(page);
        let zipName = `${title}.zip`;
        let zipFullPath = path.resolve(zipPath, zipName);
        // check already download
        if (await fs.exists(zipFullPath)) {
            info(`${title} exists, skip download`);
            await page.close();
            return;
        }
        await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
        while(await plugin.gotoNext(page)) {
            index ++;
            await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
            info(`save for ${title}/${index}`);
        }
        await page.close();
        await browser.close();
        cp.execSync(`cd ${dir};zip '${title}.zip' *;mv '${title}.zip' ${zipPath}/;rm -rf ${dir}`);
    }

    async closeBrowser() {
        return await this.browser.close();
    }

    async isDownloaded(title) {
        let zipName = `${title}.zip`;
        let zipFullPath = path.resolve(zipPath, zipName);
        return await fs.exists(zipFullPath);
    }

    loadPlugin(url, opts) {
        let plugin = plugins.detect(url);
        if (!plugin) throw new Error(`plugin not found for url ${url}`);
        return new plugin(opts);
    }
}

(async () => {
    try {
        let DEBUG = true;
        let opts = DEBUG ? {worker: 1, headless: false, slowMo: 2000} : {worker: 2};
        let otaku = new Comtaku();
        await otaku.openBrowser(opts);
        // await otaku.browseComic(comicUrl, opts);
        await otaku.browseChapter(chapterUrl, opts);
        await otaku.closeBrowser();
    }catch(e) {
        console.error(e);
    }
})();