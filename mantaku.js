const fs = require('fs-extra');
const {EventEmitter} = require('events');
const mime = require('mime');
const p = require('path');
const utils = require('./utils');
require('json5/lib/register')
const setting = require('./setting.json5');

class Mantaku {
    constructor(opts) {
        // super();
        this.opts = Object.assign({}, {
            emulator: null,
            retry: 10,
            requestTimeout: 30000,
            filterResources: null,
            injectorPath: __dirname + '/injectors/',
        }, opts);
    }
    // selectInjector(url) {
    //     let mapping = {
    //         'mangabz.js': ['www.mangabz.com', 'www.xmanhua.com'],
    //         'manhuagui.js': ['www.manhuagui.com', 'tw.manhuagui.com', 'www.mhgui.com'],
    //     }

    //     for (let file in mapping) {
    //         let match = mapping[file].filter((regex) => {
    //             return url.match(regex);
    //         });
    //         if (match.length > 0) {
    //             return file;
    //         }
    //     }
    //     return null;
    // }
    // async inject(page) {
    //     await page.evaluate(await fs.readFile(this.opts.injectorPath + 'common.js', 'utf8'));
    //     let siteJS = this.selectInjector(page.url());
    //     if (!siteJS) throw Error('No injector found for ' + page.url());
    //     await page.evaluate(await fs.readFile(this.opts.injectorPath + siteJS, 'utf8'));
    // }
    // async searchManga(page, query) {
    //     await this.inject(page);
    //     return await page.evaluate((query) => {
    //         return __mantaku.searchInfo(query);
    //     }, query);
    // }

    async browseManga(page) {
        await this.inject(page);
        return await page.evaluate(() => {
            return __mantaku.mangaInfo();
        });
    }

}

class SiteManager {
    static site = null;
    static scriptPath = __dirname + '/injectors/';
    // constructor() {
    //     this.sites = null;
    //     this.scriptPath = __dirname + '/injectors/';
    // }
    static async load(forceReload = false) {
        if (this.sites && !forceReload) return;
        let scriptPath = this.scriptPath;
        let files = await fs.readdir(scriptPath);
        let scripts = files.filter((file) => file.endsWith('.js'));
        console.log('load scirpt', scripts);
        for (let file of scripts) {
            if (file == 'common.js') continue;
            let site = require(scriptPath + file);
            this.sites.push({
                name: site.name,
                canHandle: site.canHandle,
                searchUrl: site.searchUrl,
                path: scriptPath + file,
            });
        }
    }

    static detect(url) {
        for (let site of this.sites) {
            if (site.canHandle && site.canHandle(url)) {
                return site;
            }
        }
        return null;
    }

    static async injectSiteScript(page) {
        await page.evaluate(await fs.readFile(this.scriptPath + 'common.js', 'utf8'));
        let siteJS = this.detect(page.url());
        if (!siteJS) throw Error('No injector found for ' + page.url());
        await page.evaluate(await fs.readFile(this.scriptPath + siteJS, 'utf8'));
    }
}

class ChapterDownloader extends EventEmitter{
    constructor() {
        super();
        // this.siteManager = new SiteManager();
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
                    const webp=require('webp-converter');
                    await webp.dwebp(`${savePath}/${i}.webp`, `${savePath}/${i}.png`, "-o");
                    await fs.unlink(`${savePath}/${i}.webp`);
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

module.exports = {Mantaku, ChapterDownloader};
