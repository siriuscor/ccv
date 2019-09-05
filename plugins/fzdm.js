let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
class FZDMPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
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
        if (u.host == 'manhua.fzdm.com') return true;
        return false;
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.pure-u-1-2 > a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerHTML}});
            // return a.map((i)=> i.href);
        });
        return hrefs.reverse();
    }

    async findNext(page) {
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
        return await this.clickLink(page, next);
    }

}

module.exports = {FZDMPlugin};