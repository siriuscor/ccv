const cliProgress = require('cli-progress');

// create new container
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total}',
}, cliProgress.Presets.legacy);

// add bars
const b1 = multibar.create(200, 0);
const b2 = multibar.create(1000, 0);

// control bars
b1.increment();
b2.update(20, {filename: "test1.txt"});
b1.update(20, {filename: "helloworld.txt"});

// stop all bars
multibar.stop();

return;

var p1 = function() { return new Promise((resolve, reject) => {
  console.log('enter 1');
  setTimeout(() => resolve('one'), 1000);
});
};
var p2 = function() { return new Promise((resolve, reject) => {
  console.log('enter 2');
  setTimeout(() => resolve('two'), 2000);
});
}
var p3 = function() { return new Promise((resolve, reject) => {
  console.log('enter 3');
  setTimeout(() => resolve('three'), 3000);
});
}
var p4 = function() { return new Promise((resolve, reject) => {
  console.log('enter 4');
  setTimeout(() => resolve('four'), 4000);
});}
let p = [p1, p2, p3, p4];

let worker = new Array(4).fill(0);
Promise.all(worker.map(async function(i, j) {
  console.log('worker', i, j);
  return await p[j]();
}))
.then(values => {
  console.log(values);
})
.catch(error => {
  console.error(error.message)
});

return 
const fs = require('fs-extra');
(async() => {
  let folders = await fs.readdir('plugins');
  console.log(folders);
})();

return;

// const {Compressor} = require('./compressor');

// let comp = new Compressor();
// comp.compress('./test/亞人001話', './test/abc.zip');
const rim = require('rimraf');
const util = require('util');
const rmdir = util.promisify(rim);
(async() => {
let result = await rmdir('abc');
})();
return;

const puppeteer = require('puppeteer');
var comicUrl = 'http://manhua.fzdm.com/3/Vol_001/';
comicUrl = 'http://comic.ikkdm.co/comiclist/1733/index.htm';
var chapterUrl = 'https://www.manhuafen.com/comic/2314/178684.html';
chapterUrl = 'http://www.dm5.com/m891445/#ipg33';
(async () => {
  try {
    console.log(process.cwd());
  const browser = await puppeteer.launch({headless: false, devtools: true});
  const page = await browser.newPage();
  // const devices = require('puppeteer/DeviceDescriptors');
  // console.log(JSON.stringify(Object.keys(devices)));
  // await page.emulate(devices['iPad']);
  //   await page.setRequestInterception(true);
  //   page.on('request', interceptedRequest => {
  // console.log("request:", interceptedRequest.url());
  // interceptedRequest.continue();
  //   });
  // await retry(page, chapterUrl);
  //   console.log(await page.$('img'));
  // page.on('console', msg => {
  //     console.log('console output->', msg.text());
  // });
  // await page.addScriptTag({path:'./jquery-3.4.1.slim.min.js'});
  // let image = await findImage(page);
  // console.log('find image:', image);
  // let nextpage = await findNext(page);
  // console.log('next page:', nextpage, nextpage.click);
  await page.goto(chapterUrl);
  let nextpage = await findNext(page);
  // let nextpage = await page.$('.img_land_next');
  // let result = await page.evaluate(() => {
      // return $('.chapterpager:first').children().last()[0].tagName == 'SPAN'
  //   return $('#page_select option:last').attr('selected') == 'selected';
  // });
    await nextpage.click({delay: 100});
    console.log('click');
    await page.waitForSelector('#imgloading', {hidden: true});
    console.log('over');
  // console.log('result', result, typeof result);
  // console.log(nextpage.click);
  // console.log(nextpage);
  // while(nextpage) {
      // await Promise.all([
      //     page.waitForNavigation(),
      //     nextpage.click(),
      // ]);
  //     let image = await findImage(page);
  //     console.log('find image', image);
  //     nextpage = await findNext(page);
  // }

  

  // const [response] = await Promise.all([
  //     page.waitForNavigation(), // The promise resolves after navigation has finished
  //     nextpage.click(), // 点击该链接将间接导致导航(跳转)
  //   ]);

  //   console.log('next page', response);
  // await browser.close();
  } catch(e) {
      console.error(e);
  }
})();

async function retry(page, url) {
  for(let i = 0; i<3; i ++) {
    try {
      await page.goto(url);
      return;
    }catch(e) {
      console.log('error', e);
      console.log('retry', i);
    }
  }
  return Promise.reject('page load error');
}
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
          // console.log(item.outerHTML);
          if (item.text() == '下一页') {
              return all[i];
          }
      }
      return null;
  });

  return nextpage;
}