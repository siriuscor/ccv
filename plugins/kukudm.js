let {DefaultPlugin} = require('./default.js');
let debug = console.log;
class KukuPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return url.host.match('kukudm.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#comiclistn dd :first-child', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        return hrefs;
    }

    async hasNext(page) {
        let content = await page.content();
        let [_, totalPage, currentPage] = content.match(/共(\d+?)页.+当前第(\d+?)页/);
        return parseInt(currentPage) < parseInt(totalPage);
    }

    async findNext(page) {
        return await page.$('img:last-child');
    }
}

module.exports = {KukuPlugin};