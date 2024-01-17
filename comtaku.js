#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const {URL} = require('url');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const plugins = require('./plugins');
const cp = require('child_process');
const {Compressor} = require('./compressor');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);
var info = console.log;
var debug = console.log;
const cliProgress = require('cli-progress');

class Comtaku {
    constructor() {
        this.comp = new Compressor();
        this.browser = null;
    }

    async browseComic(url, opts={}) {
        let plugin = await this.loadPlugin(url, opts);
        let browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
        this.browser = browser;
        let page = await browser.newPage();

        await fs.ensureDir(opts.output);
        await fs.writeFile(path.resolve(opts.output, 'readme.txt'), url);
        await plugin.init(page);
        await plugin.retry(plugin.open, page, url);
        let name = await plugin.findName(page);
        let chapters = await plugin.findChapters(page);
        info(`Name ${name}, Found ${chapters.length} Chapters, Worker ${opts.worker}`);
        if (name !== null) {
            opts.output = path.resolve(opts.output, name);
        }
        let worker = new Array(parseInt(opts.worker)).fill(0);
        let lowerBound = 0;
        let upperBound = chapters.length - 1;
        if (opts.range) {
            lowerBound = opts.range.split('-')[0] || 0;
            upperBound = opts.range.split('-')[1] || chapters.length - 1;
            info(`Download Range specified ${lowerBound} - ${upperBound}`);
        }

        // let mbar;
        // if (opts.debug) {
        //     mbar = new cliProgress.MultiBar({
        //         clearOnComplete: false,
        //         hideCursor: true,
        //         format: ' {worker} |{bar} | {filename} | {value}/{total}',
        //     }, cliProgress.Presets.legacy);
        // }

        let index = lowerBound;
        await Promise.all(worker.map(async (_, i) => {
            // let bar = multibar.create(1000, 0);
            let workerLog = function(){};//info.bind(info, `[Worker ${i}]`);
            while(index <= upperBound) {
                let current = index++;
                workerLog(`Processing Index: ${current}, ${chapters[current].name}`);
                // bar.update({filename: chapters[current].name, worker:'WK'+i});
                // info(`[Worker ${i}] is Processing Index: ${current}, ${chapters[current].name}`);
                try {
                    await this.browseChapter(chapters[current], opts, workerLog, bar);
                }catch(e) {
                    workerLog(`Download ${JSON.stringify(chapters[current])} Failed,Index ${current} Error ${e.toString()}`)
                }
            }
        }));
        await browser.close();
        multibar.stop();
    }

    async browseChapter(url, opts={}, workerLog, bar) {
        let title = null;
        if (typeof url == 'object') {
            let chapterInfo = url;
            url = chapterInfo.url;
            title = chapterInfo.name;
        }
        if (await this.isDownloaded(title, opts.output)) {
            workerLog(`${title} exists, skip download`);
            return;
        }
        workerLog(`Begin Browse ${title} at ${url}`);
        if (!this.browser) {
            this.browser = await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
        }
        let plugin = await this.loadPlugin(url, opts);
        let page = await this.browser.newPage();
        await plugin.init(page);
        await plugin.retry(plugin.open, page, url);
        if (!title) title = await plugin.findTitle(page);
        // check already download
        if (await this.isDownloaded(title, opts.output)) {
            workerLog(`${title} exists, skip download`);
            await page.close();
            return;
        }
        let dir = path.resolve(opts.output, title);
        await fs.ensureDir(dir);
        let index = 1;
        let zipName = `${title}.zip`;
        let zipFullPath = path.resolve(opts.output, zipName);
        await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
        while(await plugin.hasNext(page)) {
            index ++;
            await plugin.retry(plugin.gotoNext, page);
            await plugin.findImageAndSave(page, path.resolve(dir, `${index}`));
            workerLog(`save for ${title}/${index}`);
            // debug(`save to ${path.resolve(dir, index+'')}`);
        }
        await page.close();
        // await browser.close();
        workerLog(`chapter ${title} read over`);
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

module.exports = {Comtaku};
