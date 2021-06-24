let {DefaultPlugin} = require('./default.js');
let debug = console.log;
class KukuPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({filterResources: (url) => {
            return url.match('pc.weizhenwx.com');
        }}, options));
    }
    
    static canHandle(url) {
        return url.host.match('kukudm.com') || url.host.match('comic.ikkdm.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#comiclistn dd :first-child', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        // hrefs = hrefs.filter((a) => a.name.match('before'));
        return hrefs;
    }

    async hasNext(page) {
        let content = await page.content();
        let [_, totalPage, currentPage] = content.match(/共(\d+?)页.+当前第(\d+?)页/);
        return parseInt(currentPage) < parseInt(totalPage);
    }

    async findNext(page) {
        return await page.evaluateHandle(() => {
            var all = document.getElementsByTagName('a');
            return all[all.length - 1];
        });
    }
}

module.exports = {KukuPlugin};