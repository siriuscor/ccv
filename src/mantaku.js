const fs = require('fs-extra');
const {EventEmitter} = require('events');
const mime = require('mime');
const p = require('path');
const utils = require('./utils');

class Mantaku {
    constructor() {
        this.browser = null;
    }
    async init(opts) {
        opts = opts || {};
        await SiteManager.load();
        if (opts.usePuppeteer) {
            await this.initHeadlessBrowser(opts.puppeteerOpts);
        }
    }

    listSites() {
        return SiteManager.list();
    }

    async initHeadlessBrowser(opts) {
        const puppeteer = require('puppeteer-core');
        opts = Object.assign({ignoreHTTPSErrors: true}, opts);
        if (!opts.executablePath) {
            opts.executablePath = utils.getDefaultChromePath();
        }
        this.browser = await puppeteer.launch(opts);
        const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
        this.blocker = PuppeteerBlocker.parse(fs.readFileSync(__dirname + '/easylist.txt', 'utf-8'));
    }

    async newBrowserPage() {
        let page = await this.browser.newPage();
        this.blocker.enableBlockingInPage(page);
        return page;
    }

    async browseManga(page) {
        await SiteManager.injectSiteScript(page);
        return await page.evaluate(() => {
            return __mantaku.mangaInfo();
        });
    }

    async DownloadChapter(page, url, title, path) {
        let cd = new ChapterDownloader();
        cd.download(page, url, title, path);
        return cd;
    }

    async search(page, siteName, keyword) {
        return await SiteManager.search(page, siteName, keyword);
    }
}

class SiteManager {
    static sites = null;
    static scriptPath = __dirname + '/sites/';
    static async load(forceReload = false) {
        if (this.sites && !forceReload) return;
        this.sites = {};
        let scriptPath = this.scriptPath;
        let files = await fs.readdir(scriptPath);
        let scripts = files.filter((file) => file.endsWith('.js'));
        // console.log('load scirpt', scripts);
        for (let file of scripts) {
            if (file == 'common.js') continue;
            let site = require(scriptPath + file);
            this.sites[site.id] = {
                id: site.id,
                name: site.name,
                home: site.home,
                canHandle: site.canHandle,
                searchUrl: site.searchUrl,
                path: scriptPath + file,
            };
        }
    }

    static list() {
        let l = [];
        for (let siteName in this.sites) {
            let site = this.sites[siteName];
            l.push({id: site.id, name: site.name, home: site.home});
        }
        return l;
    }

    static detect(url) {
        for (let siteName in this.sites) {
            let site = this.sites[siteName];
            if (site.canHandle && site.canHandle(url)) {
                return site;
            }
        }
        return null;
    }

    static async injectSiteScript(page) {
        await page.evaluate(await fs.readFile(this.scriptPath + 'common.js', 'utf8'));
        let site = this.detect(page.url());
        if (!site) throw Error('No injector found for ' + page.url());
        await page.evaluate(await fs.readFile(site.path, 'utf8'));
    }

    static async search(page, siteName, keyword) {
        let site = this.sites[siteName];
        if (!site) throw new Error('site not found');
        let url = site.searchUrl(keyword);
        await utils.retry(page.goto.bind(page), url);
        await this.injectSiteScript(page);
        let result = await page.evaluate(() => {
            return __mantaku.search();
        });
        return result;
    }
}

class ChapterDownloader extends EventEmitter{
    constructor() {
        super();
    }

    async download(page, url, title, path) {
        let imageCache = {};
        page.on('response', async (response) => {
            const url = new URL(response.url());
            let type = mime.getExtension(response.headers()['content-type']);
            if (type === 'bin') type = 'png';
            if (['jpeg', 'png', 'gif', 'webp'].includes(type)) {
                response.mimeType = type;
                imageCache[url.href] = response;
            }
        });

        await page.goto(url);
        await SiteManager.injectSiteScript(page);
        let total = await page.evaluate(() => {
            return __mantaku.totalPage();
        });
        // console.log('total page', total);
        let savePath = path + '/' + title;
        await fs.ensureDir(savePath);

        for(let i = 1; i <= total; i++) {
            let image = await page.evaluate(async () => {
                return await __mantaku.getImage();
            });
            let fromCache = imageCache[image];
            if (!fromCache) {
                console.error('image not found in cache', image);
                throw new Error('image not found');
            } else {
                //debug(`save image ${url} -> ${savePath}`);
                await fs.outputFile(`${savePath}/${i}.${fromCache.mimeType}`, await imageCache[image].buffer());

                if (fromCache.mimeType === 'webp') {
                    // const webp=require('webp-converter');
                    // await webp.dwebp(`${savePath}/${i}.webp`, `${savePath}/${i}.png`, "-o");
                    // await utils.convertWebp(`${savePath}/${i}.webp`, `${savePath}/${i}.png`, "-o");
                    // await fs.unlink(`${savePath}/${i}.webp`);
                    await utils.convertWebp(savePath, i);
                }
                if (fromCache.mimeType === 'png') { // compress it to jpg
                }
            }

            await page.evaluate(async () => {
                await __mantaku.nextPage();
            });
            
            this.emit('progress', i, total);
        }

        let dir = p.resolve(path, title);
        await utils.compress(dir, p.resolve(path, `${title}.cbz`));
        await utils.rmdir(dir);
    }
}

module.exports = {Mantaku, ChapterDownloader, SiteManager};
