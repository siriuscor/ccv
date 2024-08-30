let {DefaultPlugin} = require('./default.js');
const puppeteer = require('puppeteer-core');
const fs = require('fs-extra');
const path = require('path');
let debug = console.log;
const U = require('url');
class QQPlugin extends DefaultPlugin{
    async findName(page) {
        return await page.evaluate(() => {
            return $('.top-title').text();
        });
    }

    static canHandle(url) {
        return ['ac.qq.com', 'm.ac.qq.com'].includes(url.host);
    }

    async open(page, url) {
        await page.emulate(puppeteer.devices['iPhone 6']);
        return await page.goto(url);
    }

    async findChapters(page) {
        let hrefs = await page.$$eval('.bottom-chapter-item a', a => {
            return a.map((i)=> {return {url:i.href, name:i.innerText.trim()}});
        });
        return hrefs;
    }

    async hasNext(page) {
        return false;
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
        let images = await page.evaluate(async () => {
            return await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = window.innerHeight;
                var scrollHeight = document.body.scrollHeight;
                let total = $('.comic-pic-list li').length - 1;
                var timer = setInterval(async function() {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        let images = $('.comic-pic-item img');
                        let result = [];
                        for (let i=0;i<total;i++) {
                            result.push(images[i].src);
                        }
                        resolve(result);
                    }
                }, 500);
            });
        });
        // console.log(images);
        for (let i=0;i<images.length;i++) {
            let image = images[i];
            await fs.outputFile(path.resolve(savePath, `../${i}.${this.imageCache[image].mimeType}`), await this.imageCache[image].buffer());
        }
    }
}

module.exports = {QQPlugin};