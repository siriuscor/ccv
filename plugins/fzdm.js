let {DefaultPlugin} = require('./default.js');
class FZDMPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({
        }, options));
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

}

module.exports = {FZDMPlugin};