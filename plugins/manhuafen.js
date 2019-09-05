let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
class MHFPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
            emulator: null
            // filterResources: (url) => {
            //     if (url.match(/baidu\.com/)) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // }
        }, options));
    }

    static canHandle(url) {
        let u = new URL(url);
        if (u.host == 'www.manhuafen.com') return true;
        return false;
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#chapter-list-1 a', a => {
            return a.map((i)=> {return {url:i.href, name:i.title}});
        });
        return hrefs.reverse();
    }

    async findNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#page_select option:last').attr('selected') == 'selected';
        });
        if (lastPage) return null;
        else return await page.$('.img_land_next');
    }
}

module.exports = {MHFPlugin};