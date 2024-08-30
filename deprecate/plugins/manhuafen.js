let {DefaultPlugin} = require('./default.js');
class MHFPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'www.manhuafen.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#chapter-list-1 a', a => {
            return a.map((i)=> {return {url:i.href, name:i.title}});
        });
        return hrefs.reverse();
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#page_select option:last').attr('selected') == 'selected';
        });
        if (lastPage) return false;
        else return true;
    }

    async findNext(page) {
        return await page.$('.img_land_next');
    }
}

module.exports = {MHFPlugin};