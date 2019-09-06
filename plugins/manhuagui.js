let {DefaultPlugin} = require('./default.js');
class MHGPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
            emulator: null
        }, options));
    }

    static canHandle(url) {
        return (url.host == 'tw.manhuagui.com');
    }

    async open(page, url) {
        await page.goto(url);
        await page.waitForSelector('#imgLoading', {hidden: true});
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.chapter-list a', a => {
            return a.map((i)=> {return {url:i.href, name:i.title}});
        });
        return hrefs.reverse();
    }

    async gotoNext(page) {
        let next = await this.findNext(page);
        await next.click({delay: 100});
        await page.waitForSelector('#mangaBox', {visible: true});
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#pageSelect option:last').attr('selected') == 'selected';
        });
        if (lastPage) return false;
        else return true;
    }
}

module.exports = {MHGPlugin};