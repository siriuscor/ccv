let {DefaultPlugin} = require('./default.js');
class MHDPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'www.manhuaniu.com');
    }

    async findName(page) {
        return await page.evaluate(() => {
            return $('.book-title').text().trim();
        });
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#chapter-list-1 a', a => {
            return a.map((i)=> {return {url:i.href, name:i.text.trim()}});
        });
        return hrefs.reverse();
    }

    // async findNext(page) {
    //     return await page.$('.main-btn a')[3];
    // }

    async gotoNext(page) {
        let next = await this.findNext(page);
        return await Promise.all([
            page.waitForNavigation(),
            page.evaluate(() => {
                SinTheme.nextPage();
            })
        ]);
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            return $('.pageSelect option:last').attr('selected') == 'selected';
        });
        if (lastPage) return false;
        else return true;
    }

    async findImage(page) {
        return await page.$$eval('#tbCenter #images img', imgs => {
            // if (imgs.length == 0) return null;
            // return imgs.sort((a, b) => b.offsetHeight*b.offsetWidth - a.offsetHeight*a.offsetWidth)[0].src;
            return imgs[0].src;
        });
    }
}

module.exports = {MHDPlugin};