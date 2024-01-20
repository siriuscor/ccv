#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs-extra');
const plugins = require('./plugins');
const debug = require('debug')('comtaku');
var info = debug;//console.log;
// var debug = console.log;
// const cliProgress = require('cli-progress');

class Comtaku {
    constructor() {
        this.browser = null;
    }

    async initBrowser(opts) {
        return await puppeteer.launch(Object.assign({ignoreHTTPSErrors: true}, opts));
    }

    async browseComic(url, opts={}) {
        let plugin = await this.loadPlugin(url, opts);
        this.browser = await this.initBrowser(opts);
        let page = await this.browser.newPage();

        await fs.ensureDir(opts.output);
        await fs.writeFile(path.resolve(opts.output, 'readme.txt'), url);
        await plugin.init(page);
        await plugin.retry(plugin.open, page, url);
        let meta = await plugin.findMeta(page);
        let name = meta.name;
        let chapters = meta.chapters;//await plugin.findChapters(page);
        // page.close();
        info(`Name ${name}, Found ${chapters.length} Chapters, Worker ${opts.worker}`);
        // if (name !== null) {
            // opts.output = path.resolve(opts.output, name);
        // }

        if (opts.info) {
            console.log(meta);
            console.table(chapters);
            return;
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
            let workerLog = info.bind(info, `[Worker ${i}]`);
            while(index <= upperBound) {
                let current = index++;
                workerLog(`Processing Index: ${current}, ${chapters[current].name}`);
                try {
                    await this.browseChapter(chapters[current], opts, workerLog);
                }catch(e) {
                    workerLog(`Download ${JSON.stringify(chapters[current])} Failed,Index ${current} Error ${e.toString()}`)
                }
            }
        }));
        await this.browser.close();
        // multibar.stop();
    }

    async browseChapter(url, opts={}, workerLog) {
        let title = null;
        if (typeof url == 'object') {
            let chapterInfo = url;
            url = chapterInfo.url;
            title = chapterInfo.name;
        }
        if (title && await this.isDownloaded(title, opts.output)) {
            workerLog(`${title} exists, skip download`);
            return;
        }
        workerLog(`Begin Browse ${title} at ${url}`);
        if (!this.browser) this.browser = await this.initBrowser(opts);
        let plugin = await this.loadPlugin(url, opts);
        await plugin.downloadChapter(this.browser, title, url, opts.output);
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
