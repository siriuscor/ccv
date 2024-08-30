let {DefaultPlugin} = require('./default.js');
class MHGPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    async findMeta(page) {
        return {
            name: await page.$eval('.book-title h1', el => el.innerText),
            alias:[await page.$eval('.book-title h2', el => el.innerText)],
            authors: [await page.$eval('.book-detail li:nth-child(2) span:nth-child(2) a', el => el.innerText)],
            description: await page.$eval('.book-intro #intro-cut', el => el.innerText),
            status: await page.$eval('.book-detail .status span span', el => el.innerText),
            chapters: await this.findChapters(page),
        };
    }

    static canHandle(url) {
        return (url.host == 'tw.manhuagui.com' || url.host == 'www.mhgui.com' || url.host == 'www.manhuagui.com');
    }

    async open(page, url) {
        await page.goto(url);
        // await page.waitForSelector('#imgPreLoad', {hidden: true});
        await page.waitForSelector('#imgLoading', {hidden: true});
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.chapter-list a', a => {
            return a.map((i)=> {return {url:i.href, name:i.title}});
        });
        return hrefs;
    }

    async gotoNext(page) {
        let next = await this.findNext(page);
        await next.click({delay: 100});
        await page.waitForSelector('#imgLoading', {hidden: true});
        // await page.waitForSelector('#mangaBox', {visible: true});
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#pageSelect option:last').attr('selected') == 'selected';
        });
        if (lastPage) return false;
        else return true;
    }

    async findImage(page) {
        return await page.$$eval('#mangaFile', imgs => {
            return imgs[0].src;
        });
    }
}

module.exports = {MHGPlugin};