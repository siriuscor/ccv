let {DefaultPlugin} = require('./default.js');
let debug = console.log;
const U = require('url');
class DM5Plugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }
    // async init(page) {
    //     super.init(page);
    //     await page.setRequestInterception(true);
    //     page.on('request', interceptedRequest => {
    //         let url = interceptedRequest.url();
    //         let p = U.parse(url);
    //         if (p.hostname.match('cdnmanhua.net') || p.hostname.match('dm5.com')) {
    //             console.log('request url', url);
    //             interceptedRequest.continue();
    //         } else {
    //             interceptedRequest.abort();
    //         }
    //     });
    // }

    static canHandle(url) {
        return (url.host == 'dm5.com' || url.host == 'www.dm5.com');
    }

    async open(page, url) {
        await page.setCookie({name: 'isAdult', value: '1', domain: 'www.dm5.com', path: '/'});
        return await page.goto(url, {waitUntil: 'domcontentloaded'});
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
        let url = page.url();
        // console.log('current url', url);
        let current = url.match(/-p(\d+)\//);
        if (!current) {
            url = url.replace(/\/$/, '-p2/');
        } else {
            current = parseInt(current[1]);
            url = url.replace(/-p\d+\/$/, '-p'+(current+1)+'/');
        }
        // console.log('next url', url);
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        // let next = await this.findNext(page);
        // await next.click({delay: 100});
        // await page.waitForSelector('#imgloading', {hidden: true});
    }
}

module.exports = {DM5Plugin};