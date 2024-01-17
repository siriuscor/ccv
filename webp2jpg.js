const fs = require('fs-extra');
const JSZip = require('jszip');
const path = require('path');
const decompress = require("decompress");
const webp=require('webp-converter');
const child_process = require('child_process');
const exec = require('util').promisify(child_process.exec);
// const imageType = require('image-type');
// const readTrunk = require('read-chunk');
const ffmpegPath = '.\\ffmpeg.exe';

let folder = process.argv[2]; //'./test';
if (!folder) {
    console.log('input a folder with webp zip file');
    console.log('example: node .\\webp2jpg.js .\\test');
    exit(1);
}

const tmpPath = 'tmp';

async function main(dir) {
    let list = await fs.readdir(dir);
    for(let i = 0; i < list.length; i++) {
        let zip = new JSZip();
        let item = list[i];
        if (!item.endsWith('.zip')) continue;
        console.time('process '+item);
        let itemPath = path.resolve(dir, item);
        if (await fs.exists(tmpPath)) await fs.remove(tmpPath);
        await decompress(itemPath, tmpPath);
        
        for(let pic of await fs.readdir(tmpPath)) {
            let picPath = path.resolve(tmpPath, pic);
            let jpgPath = picPath.replace(/\.jpeg$/, '.jpg');

            // await webp.dwebp(picPath, picPath, "-o");
            await exec(`${ffmpegPath} -hide_banner -loglevel error -y -i ${picPath} ${jpgPath}`);
            zip.file(pic, fs.readFile(jpgPath), {binary: true});
        }
        let content = await zip.generateAsync({type:"nodebuffer"});
        await fs.outputFile(path.resolve(dir, item), content);
        await fs.remove(tmpPath);
        console.timeEnd('process '+item);
    }
}

main(folder).catch(e => {
    console.error(e.stderr.toString());
});
