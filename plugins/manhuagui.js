let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
class MHGPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
            emulator: null
        }, options));
    }

    static canHandle(url) {
        let u = new URL(url);
        if (u.host == 'tw.manhuagui.com') return true;
        return false;
    }

    async goto(page, url) {
        this.imageCache = {};
        for (let i = 0; i < this.options.retry; i++) {
            try {
                await page.goto(url);
                await page.waitForSelector('#imgLoading', {hidden: true});
                return true;
            } catch (e) {
                debug(`request error ${e.toString()}, retry ${i}`);
            }
        }
        throw new Error(`page ${url} load error, reach max retry`);
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.chapter-list a', a => {
            return a.map((i)=> {return {url:i.href, name:i.title}});
        });
        return hrefs.reverse();
    }

    async gotoNext(page) {
        let next = await this.findNext(page);
        if (!next || !next.click) return null;
        for (let i = 0; i < this.options.retry; i++) {
            try {
                await next.click({delay: 100});
                await page.waitForSelector('#mangaBox', {visible: true});
                return true;
            } catch (e) {
                debug(`navigation error ${e.toString()}, retry ${i}`);
            }
        }
        throw new Error(`page load error, reach max retry`);
    }
    async findNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#pageSelect option:last').attr('selected') == 'selected';
        });
        if (lastPage) return null;
        const nextpage = await page.evaluateHandle(() => {
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
        return nextpage;
    }
}

module.exports = {MHGPlugin};