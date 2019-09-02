const puppeteer = require('puppeteer');
const {URL} = require('url');
const path = require('path');
const mime = require('mime');
const fs = require('fs-extra');
const os = require('os');
// const {} = require('./plugins');
const plugins = require('./plugins');
// chapter list https://manhua.fzdm.com/3/
// detail https://manhua.fzdm.com/3/Vol_001/

var comicUrl = 'https://manhua.fzdm.com/3/Vol_001/';

class Comtaku {
    constructor() {
        this.imageCache = {};
    }
    async openBrowser() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        this.page.on('response', async (response) => {
            const url = new URL(response.url());
            let type = mime.getExtension(response.headers()['content-type']);
            // console.log(url, type, response.headers()['content-type']);
            if (['jpeg', 'png', 'gif'].includes(type)) { // cache image response
                this.imageCache[url.href] = response;
            }
            
            // let filePath = path.resolve(`./output${url.pathname}`);
            // if (path.extname(url.pathname).trim() === '') {
            // filePath = `${filePath}/index.html`;
            // }
            // await fse.outputFile(filePath, await response.buffer());
        });
    }

    async browseComic(url) {
        this.loadPlugin(url);
    }

    async browseChapter(url) {
        this.loadPlugin(url);
        let dir = await fs.mkdtemp(os.tmpdir());
        let index = 1;
        await this.page.goto(url);
        let image = await this.plugin.findImage();
        let savePath = path.resolve(dir, index + '');
        await this.saveCacheImage(image, savePath);
        let next = await this.plugin.findNext();
        while(next) {
            await Promise.all([
                this.page.waitForNavigation(),
                next.click(),
            ]);
            index ++;
            await this.saveCacheImage(await this.plugin.findImage(), path.resolve(dir, index + ''));
            next = await this.plugin.findNext();
        }
    }

    loadPlugin(url) {
        if (!this.plugin) {
            let plugin = plugins.detect(url);
            this.plugin = new plugin(this.page);
        }
    }

    async saveCacheImage(url, savePath) {
        if (!this.imageCache[url]) return;
        let type = mime.getExtension(this.imageCache[url].headers()['content-type']);
        savePath = savePath + '.' + type;
        console.log('save image', savePath);
        fs.writeFileSync(savePath, await this.imageCache[url].buffer());
    }
}

(async () => {
    try {
        let otaku = new Comtaku();
        await otaku.openBrowser();
        await otaku.browseChapter(comicUrl);
    }catch(e) {
        console.error(e);
    }
})();

/*
(async () => {
    try {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    const devices = require('puppeteer/DeviceDescriptors');
    // console.log(JSON.stringify(Object.keys(devices)));
    await page.emulate(devices['iPad']);
    //   await page.setRequestInterception(true);
    //   page.on('request', interceptedRequest => {
    // console.log("request:", interceptedRequest.url());
    // interceptedRequest.continue();
    //   });
    await page.goto(comicUrl);
    //   console.log(await page.$('img'));
    // page.on('console', msg => {
    //     console.log('console output->', msg.text());
    // });
    let image = await findImage(page);
    console.log('find image:', image);
    let nextpage = await findNext(page);
    while(nextpage) {
        await Promise.all([
            page.waitForNavigation(),
            nextpage.click(),
        ]);
        let image = await findImage(page);
        console.log('find image', image);
        nextpage = await findNext(page);
    }

    // console.log('next page:', nextpage);

    // const [response] = await Promise.all([
    //     page.waitForNavigation(), // The promise resolves after navigation has finished
    //     nextpage.click(), // 点击该链接将间接导致导航(跳转)
    //   ]);

    //   console.log('next page', response);
    await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
*/
async function findImage(page) {
    const capture = await page.evaluateHandle(() => {
        var all = $('img');
        var biggest;
        var max = 0;
        for (var i = 0; i < all.length; i++) {
            var item = $(all[i]);
            
            var area = item.width() * item.height();
            if (area > max) {
                biggest = item;
                max = area;
            }
        }
        console.log('get element', biggest.width(), biggest.height(),biggest.attr('src'));
        return biggest.get(0);
    });

    // var src = capture[1];
    var property = await capture.getProperty('src');
    return await property.jsonValue();
}

async function findNext(page) {
    const nextpage = await page.evaluateHandle(() => {
        var all = $('a');
        for (var i = 0; i < all.length; i++) {
            var item = $(all[i]);
            // console.log(item.text());
            if (item.text() == '下一页') {
                return all[i];
            }
        }
        return null;
    });

    return nextpage;
}