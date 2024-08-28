const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
const fs = require('fs-extra');
const {Mantaku, SiteManager} = require('./mantaku');

const main = async () => {
    const mainUI = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
        }
    });
    
    mainUI.loadFile('./public/index.html');

    const browser = await pie.connect(app, puppeteer);

    // const ttt = require('./injectors/manhuagui');
    // console.log(ttt);
    
    const window = new BrowserWindow({
        width:500,height:500,parent: mainUI, modal: true
    });
    let url = "https://www.mangabz.com/31141bz/";
    url = "https://www.manhuagui.com/comic/2566/";
    // url = "https://www.mangabz.com/m355521-p9/";
    // await window.loadURL(url);

    const page = await pie.getPage(browser, window);
    
    await SiteManager.load();
    let list = await SiteManager.search(page, 'mangabz', '火影');
    console.log(list);
    // let cd = new ChapterDownloader();
    // cd.on('progress', (index, total) => {
        // console.log(index, total);
    // });
    // await cd.download(page, 'https://www.manhuagui.com/comic/21107/','test', './');

    // 
    // let mantaku = new Mantaku();
    // let manga = await mantaku.browseManga(page);
    // console.log(manga);

    // let cs = manga.chapters.filter((m) => m.name.match('卷'));
    // mantaku.on('progress', (index, total) => {
    //     console.log(index, total);
    // });
    // for(let chapter of cs) {
    //     await mantaku.browseChapter(page, chapter.url, chapter.name, './');
    // }
    // window.destroy();
    
    /*
    page.on('response', async (response) => {
        const url = new URL(response.url());
        console.log('page response', url);
        // let type = mime.getExtension(response.headers()['content-type']);
        // // console.log('request url', url.href, type);
        // // if (type === 'webp') type = 'jpeg';
        // if (type === 'bin') type = 'png';
        // if (['jpeg', 'png', 'gif', 'webp'].includes(type)) { // cache image response
        //     response.mimeType = type;
        //     this.imageCache[url.href] = response;
        // }
    });
    await page.evaluate(await fs.readFile('./injectors/common.js', 'utf8'));
    await page.evaluate(await fs.readFile('./injectors/mangabz.js', 'utf8'));
    
    let total = await page.evaluate(() => {
        return __mantaku.totalPage();
    });
    console.log('total page', total);
    for(let i = 1; i <= total; i++) {
        let image = await page.evaluate(async () => {
            return await __mantaku.getImage();
        });
        console.log(image);

        await page.evaluate(async () => {
            await __mantaku.nextPage();
        });

        // await this.findImageAndSave(page, path.resolve(dir, `${index}`));
        // debug('download image', `${title}/${index}`);
        // this.emit('progress', 1);
    }
    // const mangaInfo = await page.evaluate(() => {
        // return window.mangaInfo();
    // });

    // if (!title) title = await this.findChapterTitle(page);
    // let dir = path.resolve(base, title);
    // await fs.ensureDir(dir);
    // let index = 1;
    // await this.findImageAndSave(page, path.resolve(dir, `${index}`));
    // while(await this.hasNext(page)) {
    //     index ++;
    //     await this.retry(this.gotoNext, page);
    //     await this.findImageAndSave(page, path.resolve(dir, `${index}`));
    //     debug('download image', `${title}/${index}`);
    //     // this.emit('progress', 1);
    // }
    // await page.close();
    // // await this.compressChapter(title, 'zip', base); // cbz
    // await this.compressChapter(title, 'cbz', base); // cbz

    // const result = await page.evaluate(() => {
    //     return window.myInjectedFunction();
    // });
*/
    // console.log(result);
//   window.destroy();
};

(async function() {
    await pie.initialize(app);
    app.whenReady().then(main).catch(e => {
        console.error("CATCH ERROR", e);
    });
})();
