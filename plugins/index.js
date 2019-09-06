let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
let {FZDMPlugin} = require('./fzdm.js');
let {MHFPlugin} = require('./manhuafen.js');
let {DM5Plugin} = require('./dm5');
let {MHGPlugin} = require('./manhuagui');

let plugins = [FZDMPlugin, MHFPlugin, DM5Plugin, MHGPlugin];

function detect(url) {
    let u = new URL(url);
    let p = plugins.filter((p) => p.canHandle(u));
    if (p.length > 0) {
        console.log(`PLUGIN: ${p[0].name} DETECTED`);
        return p[0];
    } else {
        console.log(`PLUGIN: no PLUGIN can handle ${url}`);
        return null;
    }
}

function list() {
    return plugins;
}

module.exports = {
    detect, list
}