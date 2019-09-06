const {
    URL
} = require('url');
const Devices = require('puppeteer/DeviceDescriptors');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime');

const debug = console.log;
class DefaultPlugin {
    constructor(options) {
        this.options = Object.assign({}, {
            emulator: null,
            retry: 10,
            requestTimeout: 30000,
            filterResources: null
        }, options);
        this.imageCache = {};
    }

    static canHandle(url) {
        return false;
    }

    /* search for comic name in site */
    static async search(name) {
        return [{name:'123123', url:'adfsdfsadf', from:'abc'}, {name:'123123', url:'adfsdfsadf', from:'abc'}];
    }

    async init(page) {
        if (this.options.emulator) await page.emulate(Devices[this.options.emulator]);
        page.on('response', async (response) => {
            const url = new URL(response.url());
            let type = mime.getExtension(response.headers()['content-type']);
            if (['jpeg', 'png', 'gif'].includes(type)) { // cache image response
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
        // page.on('console', msg => {
            // console.log(`from console: ${msg.text()}`);
        // });
    }

    async retry(proc, ...args) {
        for (let i = 0; i < this.options.retry; i++) {
            try {
                return await proc.apply(this, args);
            } catch (e) {
                debug(`process error ${e.toString()}, retry ${i}`);
            }
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

    async findChapters(page) {
        return [];
    }
    async findTitle(page) {
        return await page.title();
    }
    async findImage(page) {
        return await page.$$eval('img', imgs => {
            if (imgs.length == 0) return null;
            return imgs.sort((a, b) => b.offsetHeight*b.offsetWidth - a.offsetHeight*a.offsetWidth)[0].src;
        });
        // const capture = await page.evaluateHandle(() => {
        //     var all = $('img');
        //     var biggest;
        //     var max = 0;
        //     for (var i = 0; i < all.length; i++) {
        //         var item = $(all[i]);
        //         var area = item.width() * item.height();
        //         if (area > max) {
        //             biggest = item;
        //             max = area;
        //         }
        //     }
        //     return biggest.get(0);
        // });
        // var property = await capture.getProperty('src');
        // return await property.jsonValue();
    }

    async findImageAndSave(page, savePath) {
        let url = await this.findImage(page);
        if (!this.imageCache[url]) {
            debug(`image ${url} not found in cache`);
            return;
        }
        let type = this.imageCache[url].mimeType;
        savePath = savePath + '.' + type;
        // debug(`save image ${url} -> ${savePath}`);
        await fs.outputFile(savePath, await this.imageCache[url].buffer());
    }

    async findNext(page) {
        return await page.evaluateHandle(() => {
            var all = $('a');
            for (var i = 0; i < all.length; i++) {
                var item = $(all[i]);
                var text = item.text();
                if (text == '下一页' || text == '下一頁') {
                    return all[i];
                }
            }
            return null;
        });
    }
}

module.exports = {
    DefaultPlugin
};