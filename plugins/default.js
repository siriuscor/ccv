const {URL} = require('url');
class DefaultPlugin {
    constructor(page) {
        this.page = page;
    }
    async init() {
        const devices = require('puppeteer/DeviceDescriptors');
        await page.emulate(devices['iPad']);
        //   await page.setRequestInterception(true);
    //   page.on('request', interceptedRequest => {
    // console.log("request:", interceptedRequest.url());
    // interceptedRequest.continue();
    //   });
        
    }

    async findList() {
        return [];
    }

    async findImage() {
        const capture = await this.page.evaluateHandle(() => {
            var all = $('img');
            var biggest;
            var max = 0;
            for (var i = 0; i < all.length; i++) {
                var item = $(all[i]);
                var area = item.width() * item.height();
                if (area > max) {
                    biggest = item;
                    max = area;
                }
            }
            // console.log('get element', biggest.width(), biggest.height(),biggest.attr('src'));
            return biggest.get(0);
        });
        var property = await capture.getProperty('src');
        return await property.jsonValue();
    }

    async findNext() {
        const nextpage = await this.page.evaluateHandle(() => {
            var all = $('a');
            for (var i = 0; i < all.length; i++) {
                var item = $(all[i]);
                if (item.text() == '下一页') {
                    return all[i];
                }
            }
            return null;
        });
        // var property = await nextpage.getProperty('href');
        // return await property.jsonValue();
        return nextpage;
    }
}

module.exports = { DefaultPlugin };