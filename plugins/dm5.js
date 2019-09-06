let {DefaultPlugin} = require('./default.js');
let debug = console.log;
class DM5Plugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'dm5.com' || url.host == 'www.dm5.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#detail-list-select-1 a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        return hrefs.reverse();
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('.chapterpager:first').children().last()[0].tagName == 'SPAN'
        });
        if (lastPage) return false;
        else return true;
    }

    async gotoNext(page) {
        let next = await this.findNext(page);
        await next.click({delay: 100});
        await page.waitForSelector('#imgloading', {hidden: true});
    }
}

module.exports = {DM5Plugin};