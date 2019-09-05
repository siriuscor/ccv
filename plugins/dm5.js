let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
let debug = console.log;
class DM5Plugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
            emulator: null
        }, options));
    }

    static canHandle(url) {
        let u = new URL(url);
        if (u.host == 'dm5.com' || u.host == 'www.dm5.com') return true;
        return false;
    }

    async findChapters(page) {
        //Array.from(document.querySelectorAll('#detail-list-select-1 a'))
        let hrefs = await page.$$eval('#detail-list-select-1 a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        return hrefs.reverse();
    }

    async findNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('.chapterpager:first').children().last()[0].tagName == 'SPAN'
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

    async gotoNext(page) {
        let next = await this.findNext(page);
        if (!next || !next.click) return null;
        for (let i = 0; i < this.options.retry; i++) {
            try {
                await next.click({delay: 100});
                await page.waitForSelector('#imgloading', {hidden: true});
                return true;
            } catch (e) {
                debug(`navigation error ${e.toString()}, retry ${i}`);
            }
        }
        throw new Error(`page load error, reach max retry`);
    }
}

module.exports = {DM5Plugin};