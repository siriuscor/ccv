const fs = require('fs-extra');
const JSZip = require('jszip');
const path = require('path');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);
const sharp = require('sharp');
sharp.cache(false);

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

async function convertWebp(savePath, i) {
    let name = `${savePath}/${i}`;
    await sharp(name + '.webp')
        .jpeg({ quality: 70})
        .toFile(name + '.jpg');
    await fs.unlink(`${name}.webp`);
}

async function convertPng(savePath, i) {
    let name = `${savePath}/${i}`;
    await sharp(name + '.png')
        .jpeg({ quality: 70})
        .toFile(name + '.jpg');
    await fs.unlink(`${name}.png`);
}

module.exports = {
    compress, rmdir,
    sleep, retry, 
    getDefaultChromePath, getDefaultBasePath,
    startLoading, stopLoading,
    convertWebp, convertPng,
}