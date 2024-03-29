const {URL} = require('url');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime');
const http = require('http');
const https = require('https');
const {EventEmitter} = require('events');
const child_process = require('child_process');
const exec = require('util').promisify(child_process.exec);
var Stream = require('stream').Transform;
const debug = require('debug')('comtaku:default');
const utils = require('../utils');

class DefaultPlugin extends EventEmitter{
    constructor(options) {
        super();
        this.options = Object.assign({}, {
            emulator: null,
            retry: 10,
            requestTimeout: 30000,
            filterResources: null
        }, options);
        this.imageCache = {};
    }

    static canHandle(url) {
        throw new Error('not implemented');
    }

    /* search for comic name in site */
    static async search(name) {
        return [];
    }

    async init(page) {
        // if (this.options.emulator) await page.emulate(Devices[this.options.emulator]);
        page.on('response', async (response) => {
            const url = new URL(response.url());
            let type = mime.getExtension(response.headers()['content-type']);
            // console.log('request url', url.href, type);
            // if (type === 'webp') type = 'jpeg';
            if (type === 'bin') type = 'png';
            if (['jpeg', 'png', 'gif', 'webp'].includes(type)) { // cache image response
                response.mimeType = type;
                this.imageCache[url.href] = response;
            }
        });
        if (this.options.filterResources) {
            await page.setRequestInterception(true);
            page.on('request', interceptedRequest => {
                let url = interceptedRequest.url();
                if (this.options.filterResources(url)) {
                    debug(`filtered request ${url}`);
                    interceptedRequest.abort();
                }
                interceptedRequest.continue();
            });
        }

        if (this.options.debug) {
            page.on('console', msg => {
                console.log(`from console: ${msg.text()}`);
            });
        }
    }

    async sleep(timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
    async retry(proc, ...args) {
        for (let i = 0; i < this.options.retry; i++) {
            try {
                return await proc.apply(this, args);
            } catch (e) {
                debug(`process error ${e.toString()}, retry ${i}`);
            }
            await this.sleep(1000);
        }
        return await Promise.reject('process error reach max retry');
    }

    async open(page, url) {
        return await page.goto(url);
    }

    async hasNext(page) {
        let next = await this.findNext(page);
        if (!next || !next.click) return false;
        else return next;
    }

    async gotoNext(page) {
        let next = await this.findNext(page);
        return await Promise.all([
            page.waitForNavigation(),
            next.click({delay: 100}),
        ]);
    }

    async findMeta(page) {
        return {
            name: '',
            alias:{},
            authors: [],
            published: '',
            genres: [],
            description: '',
            status: '',
            volumes: [],
            chapters: await this.findChapters(page)
        };
    }
    async findChapters(page) {
        throw new Error('not implemented');
    }
    async findChapterTitle(page) {
        return await page.title();
    }

    async findImage(page) {
        return await page.$$eval('img', imgs => {
            if (imgs.length == 0) return null;
            return imgs.sort((a, b) => b.offsetHeight*b.offsetWidth - a.offsetHeight*a.offsetWidth)[0].src;
        });
    }

    async findImageAndSave(page, savePath) {
        let url = await this.findImage(page);
        if (!this.imageCache[url]) {
            debug(`image ${url} not found in cache, cache check`);
            debug(Object.keys(this.imageCache));
            throw new Error('image not found');
            // await page.goto(url);
            // return await this.findImageAndSave(page, savePath);
            // return await this.downloadImage(url, savePath);
        }
        let type = this.imageCache[url].mimeType;
        savePath = savePath + '.' + type;
        debug(`save image ${url} -> ${savePath}`);
        await fs.outputFile(savePath, await this.imageCache[url].buffer());

        if (type == 'webp') {
            await this.convertWebp(savePath);
        }
    }

    async convertWebp(path) {
        let jpgPath = path.replace(/\.webp$/, '.jpg');
        await exec(`.\\ffmpeg.exe -hide_banner -loglevel error -y -i "${path}" "${jpgPath}"`);
        await fs.remove(path);
    }

    downloadImage(url, filename) {
        return new Promise((resolve, reject) => {
            var client = http;
            if (url.toString().indexOf("https") === 0){
                client = https;
            }

            client.request(url, function(response) {
                var data = new Stream();
                response.on('data', function(chunk) {
                    data.push(chunk);
                });
                response.on('end', function() {
                    fs.writeFileSync(filename, data.read());
                    resolve();
                });
                response.on('error', (e) => {
                    reject(e);
                });
            }).end();
        })
    }


    async findNext(page) {
        return await page.evaluateHandle(() => {
            var all = $('a');
            for (var i = 0; i < all.length; i++) {
                var item = $(all[i]);
                var text = item.text();
                if (text.match('下一页') || text.match('下一頁')) {
                    return all[i];
                }
            }
            return null;
        });
    }

    async downloadChapter(browser, title, url, base) {
        let page = await browser.newPage();
        await this.init(page);
        await this.retry(this.open, page, url);
        if (!title) title = await this.findChapterTitle(page);
        let dir = path.resolve(base, title);
        await fs.ensureDir(dir);
        let index = 1;
        await this.findImageAndSave(page, path.resolve(dir, `${index}`));
        while(await this.hasNext(page)) {
            index ++;
            await this.retry(this.gotoNext, page);
            await this.findImageAndSave(page, path.resolve(dir, `${index}`));
            debug('download image', `${title}/${index}`);
            // this.emit('progress', 1);
        }
        await page.close();
        await this.compressChapter(title, 'zip', base);
    }

    async compressChapter(title, type, base) {
        let dir = path.resolve(base, title);
        await utils.compress(dir, path.resolve(base, `${title}.${type}`));
        await utils.rmdir(dir);
    }
}

module.exports = {
    DefaultPlugin
};