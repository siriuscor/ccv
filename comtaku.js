#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const {URL} = require('url');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const plugins = require('./plugins');
const cp = require('child_process');
const program = require('commander');
const {Compressor} = require('./compressor');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);
var info = console.log;
var debug = console.log;

class Comtaku {
    constructor() {
        this.comp = new Compressor();
    }

    async browseComic(url, opts={}) {
        let plugin = await this.loadPlugin(url, opts);
        let browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
        let page = await browser.newPage();
        await plugin.init(page);
        await plugin.open(page, url);
        let chapters = await plugin.findChapters(page);
        info(`FOUND ${chapters.length} Chapters`);
        await browser.close();
        let worker = new Array(opts.worker).fill(0);
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
        if (await this.isDownloaded(title, opts.output)) {
            info(`${title} exists, skip download`);
            return;
        }
        info(`BEGIN Browse ${title} at ${url}`);
        let browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
        let plugin = await this.loadPlugin(url, opts);
        let page = await browser.newPage();
        await plugin.init(page);
        await plugin.retry(plugin.open, page, url);
        if (!title) title = await plugin.findTitle(page);
        let dir = path.resolve(opts.output, title);
        await fs.ensureDir(dir);
        let index = 1;
        let zipName = `${title}.zip`;
        let zipFullPath = path.resolve(opts.output, zipName);
        // check already download
        if (await this.isDownloaded(title, opts.output)) {
            info(`${title} exists, skip download`);
            await page.close();
            return;
        }
        await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
        while(await plugin.hasNext(page)) {
            index ++;
            await plugin.retry(plugin.gotoNext, page);
            await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
            info(`save for ${title}/${index}`);
            // debug(`save to ${path.resolve(dir, index+'')}`);
        }
        await page.close();
        await browser.close();
        info(`chapter ${title} read over`);
        await this.comp.compress(dir, zipFullPath);
        await rmdir(dir);
        // cp.execSync(`cd ${dir};zip '${zipName}' *;mv '${zipName}' '${zipFullPath}';rm -rf ${dir}`);
    }

    async isDownloaded(title, output) {
        let zipName = `${title}.zip`;
        let zipFullPath = path.resolve(output, zipName);
        return await fs.exists(zipFullPath);
    }

    async loadPlugin(url, opts) {
        await plugins.load();
        let plugin = plugins.detect(url);
        if (!plugin) throw new Error(`plugin not found for url ${url}`);
        return new plugin(opts);
    }

    async searchComic(name) {
        let ps = plugins.list();
        let list = await Promise.all(ps.map(async plugin => plugin.search(name)));
        return [].concat(...list);
    }
}

program
    .version('0.0.1')
    .option('-d, --debug', 'output extra debugging')
    .option('-c, --chapter', 'specify a chapter url')
    .option('-w, --worker <number>', 'parallel wokers number', 2)
    .option('-o, --output <dir>', 'output dir')
    .option('-s, --search', 'search for comic name')
    .option('--chrome', 'specify local chrome path')
    .arguments('<url>')
    .parse(process.argv);

(async () => {
    try {
        let opts = program.opts();
        if (!opts.chrome) opts.chrome = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        url = program.args[0];
        if (opts.debug) {
            opts = Object.assign(opts, {worker: 1, headless: false, slowMo: 200, devtools: true});
        }
        if (opts.output) opts.output = path.resolve(process.cwd(), opts.output);
        else opts.output = process.cwd();
        await fs.ensureDir(opts.output);
        opts.executablePath = opts.chrome;
        let otaku = new Comtaku();
        if (opts.search) {
            let list = await otaku.searchComic(url);
            console.table(list);
            return;
        }
        if (opts.chapter) {
            await otaku.browseChapter(url, opts);
        } else {
            await otaku.browseComic(url, opts);
        }
    }catch(e) {
        console.error(e);
    }
})();

//./comtaku.js -o ../yaren https://manhua.fzdm.com/41/
