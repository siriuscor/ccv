const fs = require('fs-extra');
const JSZip = require('jszip');
const path = require('path');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);
// const sharp = require('sharp');
// sharp.cache(false);

async function pack(dir, to, type, mangaInfo) {
    switch(type) {
        case 'epub':
            await toEpub(dir, to + '.epub', mangaInfo);
            break;
        case 'cbz':
            await compress(dir, to + '.cbz', mangaInfo);
            break;
        case 'zip':
            await compress(dir, to + '.zip', mangaInfo);
            break;
        default:
            throw new Error('unknown type ' + type);
    }
}


async function toEpub(dir, to, mangaInfo) {
    let firstPage = null;
    let images = await fs.readdir(dir);
    images.sort((a, b) => {
        let aNum = parseInt(path.parse(a).name);
        let bNum = parseInt(path.parse(b).name);
        return aNum - bNum;
    });
    let pages = images.map(file => {
        if (!firstPage) firstPage = path.join(dir, file);
        return {
            title: '第' + path.parse(file).name + '页',
            data: `<img src="${path.join(dir, file)}" />`
        };
    });

    const option = {
        title: path.parse(to).name,
        cover: firstPage,
        content: pages,
        hideToC: true,
        lang: 'zh-CN',
        appendChapterTitles: false,
        css: `
        body {
            display: block;
            margin: 0;
            padding: 0;
        }
        `
    };
    if (mangaInfo) {
        if (mangaInfo.title) option.title = mangaInfo.title + ' ' + option.title;
        if (mangaInfo.author) option.author = mangaInfo.author;
        if (mangaInfo.intro) option.description = mangaInfo.intro;
        
    }

    const {EPub} = await import("@lesjoursfr/html-to-epub");
    let epub = new EPub(option, to);
    await epub.render();
}

async function compress(dir, zipName) {
    let list = await fs.readdir(dir);
    var zip = new JSZip();
    for(let i = 0; i < list.length; i++) {
        let item = list[i];
        zip.file(item, fs.readFile(path.resolve(dir, item)), {binary: true});
    }
    let content = await zip.generateAsync({type:"nodebuffer"});
    await fs.outputFile(zipName, content);
}

async function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
async function retry(proc, ...args) {
    let last_error = null;
    for (let i = 0; i < 3; i++) {
        try {
            return await proc(...args);
        } catch (e) {
            last_error = e;
        }
        await sleep(1000);
    }
    throw last_error;
    // return await Promise.reject(last_error);
}

function getDefaultChromePath() {
    if (process.platform === "win32") {
        return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    } else {
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
}

function getDefaultBasePath() {
    return process.cwd();
}

function twirlTimer(str) {
    const icon = ['⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r" + icon[x++] + str);
      x %= icon.length;
    }, 200);}
let loading = null;
function startLoading() {
    loading = twirlTimer(' 读取中...');
}

function stopLoading() {
    clearInterval(loading);
    process.stdout.write("\r");
}

const webp = require('webp-converter');
const {Jimp} = require('jimp');
async function convertWebp(savePath, i) {
    let name = `${savePath}/${i}`;
    await webp.dwebp(`${name}.webp`, `${name}.jpg`, "-o");
    let image = await Jimp.read(`${name}.jpg`);
    await image.write(`${name}.jpg`, {quality: 70});
    // await sharp(name + '.webp')
    //     .jpeg({ quality: 70})
    //     .toFile(name + '.jpg');
    await fs.unlink(`${name}.webp`);
}

async function convertPng(savePath, i) {
    // let name = `${savePath}/${i}`;
    // await sharp(name + '.png')
    //     .jpeg({ quality: 70})
    //     .toFile(name + '.jpg');
    // await fs.unlink(`${name}.png`);
}

async function readVersion() {
    if (!await fs.exists('package.json')) {
        if (await fs.exists('version')) {
            return await fs.readFile('version', 'utf-8');
        } else {
            return '1.0.0';
        }
    } else {
        let pkg = JSON.parse(await fs.readFile('package.json'));
        return pkg.version;
    }
}

module.exports = {
    readVersion,
    compress, rmdir, pack,
    sleep, retry, 
    getDefaultChromePath, getDefaultBasePath,
    startLoading, stopLoading,
    convertWebp, convertPng,
}

// toEpub('/Users/admin/comics/JOJO的奇妙冒险Prat9 The JOJO Lands(manhuagui)/第17话', '/Users/admin/comics/JOJO的奇妙冒险Prat9 The JOJO Lands(manhuagui)/第17话.epub').catch(console.error);
