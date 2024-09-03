const fs = require('fs-extra');
const JSZip = require('jszip');
const path = require('path');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);
const cp = require('child_process');
// const webp=require('webp-converter');

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

function fetchMangaDB(name) {

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
    // if (process.platform === "win32") {
    //     return 'D:\\comics';
    // } else {
    //     return '/Volumes/comics';
    // }
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

// const {Jimp} = require('jimp');
const sharp = require('sharp');
async function convertWebp(savePath, i) {
    let name = `${savePath}/${i}`;
    await sharp(name + '.webp')
      .jpeg({ quality: 70})
      .toFile(name + '.jpg');
    // await webp.dwebp(`${savePath}/${i}.webp`, `${savePath}/${i}.jpg`, "-o");
    // let image = await Jimp.read(`${savePath}/${i}.png`);
    // await image.write(`${savePath}/${i}.jpg`, {quality: 70});
    await fs.unlink(`${name}.webp`);
    // await fs.unlink(`${savePath}/${i}.png`);
}

async function convertPng(savePath, i) {
    let name = `${savePath}/${i}`;
    await sharp(name + '.png')
      .jpeg({ quality: 70})
      .toFile(name + '.jpg');
    await fs.unlink(`${name}.png`);
}
// function convertWebp(input_image,output_image,option,logging='-quiet') {
//         const query = `"${input_image}" ${option} "${output_image}" "${logging}"`;
//         return new Promise((resolve, reject) => {
//           cp.execFile('C:\\snapshot\\ccv\\webconverter\\dwebp.exe',query.split(/\s+/),{ shell: true }, (error, stdout, stderr) => {
//           if (error) {
//            console.warn(error);
//            return reject(error);
//           }
//           resolve(stdout? stdout : stderr);
//          });
//         });
// }

module.exports = {
    fetchMangaDB, compress, rmdir,
    sleep, retry, 
    getDefaultChromePath, getDefaultBasePath,
    startLoading, stopLoading,
    convertWebp, convertPng,
}