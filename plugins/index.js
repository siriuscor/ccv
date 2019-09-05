// let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
let {FZDMPlugin} = require('./fzdm.js');
let {MHFPlugin} = require('./manhuafen.js');
let {DM5Plugin} = require('./dm5');
let {MHGPlugin} = require('./manhuagui');

let plugins = [FZDMPlugin, MHFPlugin, DM5Plugin, MHGPlugin];

function detect(url) {
    let p = plugins.filter((p) => p.canHandle(url));
    if (p.length > 0) {
        console.log(`PLUGIN: ${p[0].name} DETECTED`);
        return p[0];
    } else {
        console.log(`PLUGIN: no PLUGIN can handle ${url}`);
        return null;
    }
}

module.exports = {
    detect
}