const {URL} = require('url');
const fs = require('fs-extra');
const path = require('path');
let plugins = [];
let loaded = false;

function detect(url) {
    let u = new URL(url);
    let p = plugins.filter((p) => p.canHandle(u));
    if (p.length > 0) {
        // console.log(`PLUGIN: ${p[0].name} DETECTED`);
        return p[0];
    } else {
        console.log(`PLUGIN: no PLUGIN can handle ${url}`);
        return null;
    }
}

async function load() {
    if (loaded) return;
    let folders = await fs.readdir(path.resolve(__dirname, '.'));
    folders.forEach((file) => {
        if (file == 'index.js' || !file.endsWith('.js')) return;
        if (file == 'default.js') return;
        let ps = require('./' + file);
        for(let className in ps) {
            plugins.push(ps[className]);
        }
    });
}

function list() {
    return plugins;
}

module.exports = {
    detect, list, load
}