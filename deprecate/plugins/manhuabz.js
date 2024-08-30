let {DefaultPlugin} = require('./default.js');
class MHBZPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'www.mangabz.com' || url.host == 'www.xmanhua.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('#chapterlistload a', a => {
            //第192話 櫻島結界（2）                    
            return a.map((i)=> {return {url:i.href, name:i.text.split(' ')[0].trim()}});
        });
        return hrefs.reverse();
    }

    // async findNext(page) {
    //     return await page.$('.main-btn a')[3];
    // }

    async gotoNext(page) {
        // let next = await this.findNext(page);
        // return await Promise.all([
        await page.evaluate(() => {
                ShowNext()
            });
        await page.waitFor(1000);
        // await page.waitForSelector('#cp_image');
        await page.waitForSelector('#imgloading', {hidden: true});
        // ]);
    }

    async hasNext(page) {
        let lastPage = await page.evaluate(() => {
            var page = $('.bottom-page2').text().split('-');
            return page[0] == page[1];
        });
        if (lastPage) return false;
        else return true;
    }

    async open(page, url) {
        await page.goto(url);
        await page.waitForSelector('#imgloading', {hidden: true});
        // await page.waitForSelector('#cp_image');
    }
    async findImage(page) {
        return await page.$$eval('#cp_image', imgs => {
            return imgs[0].src;
        });
    }
}

module.exports = {MHBZPlugin};