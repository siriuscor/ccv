let {DefaultPlugin} = require('./default.js');
class FZDMPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return (url.host == 'manhua.fzdm.com');
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.pure-u-1-2 > a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerHTML}});
        });
        return hrefs.reverse();
    }

    async open(page, url) {
        await page.setCookie({name: 'picHost', value: 'http%3A//p1.manhuapan.com', domain: '.fzdm.com', path: '/'});
        await page.goto(url);
    }

    async findImage(page) {
        return await page.$$eval('#mhimg0 img', imgs => {
            return imgs[0].src.replace(/^http/, 'https');
        });
    }
    

}

module.exports = {FZDMPlugin};