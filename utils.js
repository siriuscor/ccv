const fs = require('fs-extra');
const JSZip = require('jszip');
const path = require('path');
const rimraf = require('rimraf');
const rmdir = require('util').promisify(rimraf);

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

module.exports = {
    fetchMangaDB, compress, rmdir
}