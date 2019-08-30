const puppeteer = require('puppeteer');
// chapter list https://manhua.fzdm.com/3/
// detail https://manhua.fzdm.com/3/Vol_001/

(async () => {
    try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const devices = require('puppeteer/DeviceDescriptors');
    // console.log(JSON.stringify(Object.keys(devices)));
    await page.emulate(devices['iPad']);
    //   await page.setRequestInterception(true);
    //   page.on('request', interceptedRequest => {
    // console.log("request:", interceptedRequest.url());
    // interceptedRequest.continue();
    //   });
    await page.goto('http://manhua.fzdm.com/3/Vol_001/');
    //   console.log(await page.$('img'));
    // page.on('console', msg => {
    //     console.log('console output->', msg.text());
    // });
    let image = await findImage(page);
    console.log('find image:', image);
    let nextpage = await findNext(page);
    while(nextpage) {
        await Promise.all([
            page.waitForNavigation(),
            nextpage.click(),
        ]);
        let image = await findImage(page);
        console.log('find image', image);
        nextpage = await findNext(page);
    }

    // console.log('next page:', nextpage);

    // const [response] = await Promise.all([
    //     page.waitForNavigation(), // The promise resolves after navigation has finished
    //     nextpage.click(), // 点击该链接将间接导致导航(跳转)
    //   ]);

    //   console.log('next page', response);
    await browser.close();
    } catch(e) {
        console.error(e);
    }
})();

async function findImage(page) {
    const capture = await page.evaluateHandle(() => {
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
        console.log('get element', biggest.width(), biggest.height(),biggest.attr('src'));
        return biggest.get(0);
    });

    // var src = capture[1];
    var property = await capture.getProperty('src');
    return await property.jsonValue();
}

async function findNext(page) {
    const nextpage = await page.evaluateHandle(() => {
        var all = $('a');
        for (var i = 0; i < all.length; i++) {
            var item = $(all[i]);
            // console.log(item.text());
            if (item.text() == '下一页') {
                return all[i];
            }
        }
        return null;
    });

    return nextpage;
}
