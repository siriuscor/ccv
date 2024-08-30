let {DefaultPlugin} = require('./default.js');
class BNPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'm.bnmanhua.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.list_block a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText}});
        });
        return hrefs;
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('#k_page').text() == $('#k_total').text();
        });
        if (lastPage) return false;
        else return true;
    }
}

module.exports = {BNPlugin};