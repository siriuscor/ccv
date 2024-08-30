// https://www.mkzhan.com/211879/
let {DefaultPlugin} = require('./default.js');
const fs = require('fs-extra');
const path = require('path');
class LMHPlugin extends DefaultPlugin{
    constructor(options) {
        super(Object.assign({}, options));
    }

    static canHandle(url) {
        return url.host.match('www.laimanhua.com');
    }

    async open(page, url) {
        // await page.setCookie({name: 'isAdult', value: '1', domain: 'www.dm5.com', path: '/'});
        // await page.emulate(puppeteer.devices['iPhone 6']);
        return await page.goto(url);
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.plist a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText.trim()}});
        });
        return hrefs;
    }

    async hasNext(page) {
        return false;
    }

    async findImage(page) {
        return await page.$$eval('#cp_img img', imgs => {
            return imgs[0].src;
        });
    }

    async gotoNext(page) {
        return await Promise.all([
            page.waitForNavigation(),
            page.evaluate(() => {
                nextPage();
            })
        ]);
    }

    async findImageAndSave(page, savePath) {
        let images = await page.evaluate(() => {
            var imgs = base64_decode(picTree).split('$qingtiandy$');
            return imgs;
        });
        // console.log(images);
        for (let i=0;i<images.length;i++) {
            let image = 'https://res.gezhengzhongyi.cn:8443' + encodeURI(images[i]);
            await page.goto(image);
            await fs.outputFile(path.resolve(savePath, `../${i}.${this.imageCache[image].mimeType}`), await this.imageCache[image].buffer());
        }
    }
}

module.exports = {LMHPlugin};