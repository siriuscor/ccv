// https://www.mkzhan.com/211879/
let {DefaultPlugin} = require('./default.js');
const puppeteer = require('puppeteer-core');
const fs = require('fs-extra');
const path = require('path');
// let debug = console.log;
// const U = require('url');
class MKZPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return url.host.match('www.mkzhan.com');
    }

    async open(page, url) {
        // await page.setCookie({name: 'isAdult', value: '1', domain: 'www.dm5.com', path: '/'});
        // await page.emulate(puppeteer.devices['iPhone 6']);
        return await page.goto(url);
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.chapter__list-box a', a => {
            return a.map((i)=> {return {url:'https://www.mkzhan.com' + i.getAttribute('data-hreflink'), name:i.innerText.trim()}});
        });
        return hrefs;
    }

    async hasNext(page) {
        return false;
    }

    async findImage(page) {
        return await page.$$eval('#cp_img img', imgs => {
            return imgs[0].src;
        });
    }

    async gotoNext(page) {
        return await Promise.all([
            page.waitForNavigation(),
            page.evaluate(() => {
                nextPage();
            })
        ]);
    }

    async findImageAndSave(page, savePath) {
        let images = await page.$$eval('.rd-article__pic img', imgs => {
            return imgs.map((i)=> {return i.getAttribute('data-src')});
        });
        // console.log(images);
        for (let i=0;i<images.length;i++) {
            let image = images[i];
            await page.goto(image);
            await fs.outputFile(path.resolve(savePath, `../${i}.${this.imageCache[image].mimeType}`), await this.imageCache[image].buffer());
        }
    }
}

module.exports = {MKZPlugin};