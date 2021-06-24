let {DefaultPlugin} = require('./default.js');
const puppeteer = require('puppeteer-core');
let debug = console.log;
const U = require('url');
class DM5Plugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    async findName(page) {
        return await page.evaluate(() => {
            return $('.detail-main-info-title').text();
        });
    }

    static canHandle(url) {
        return ['dm5.com', 'www.dm5.com', 'm.dm5.com'].includes(url.host);
    }

    async open(page, url) {
        await page.setCookie({name: 'isAdult', value: '1', domain: 'www.dm5.com', path: '/'});
        await page.emulate(puppeteer.devices['iPhone 6']);
        return await page.goto(url);
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.detail-list-select a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        return hrefs.reverse();
    }

    async hasNext(page) {
        let result = await page.evaluate(() => {
            // console.log('new page index', newPageIndex, newImgs.length);
            return newPageIndex+1 < newImgs.length;
        });
        // console.log('result', result);
        return result;
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
}

module.exports = {DM5Plugin};