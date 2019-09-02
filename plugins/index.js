let {URL} = require('url');
let {DefaultPlugin} = require('./default.js');
let {FZDMPlugin} = require('./fzdm.js');

let pluginMap = {
    'manhua.fzdm.com': FZDMPlugin
}

function detect(_url) {
    let u = new URL(_url);
    if (pluginMap[u.host]) {
        console.log(`PLUGIN: HOST ${u.host} DETECT`);
        return pluginMap[u.host];
    } else {
        console.log(`PLUGIN: unknown HOST ${u.host}`);
        return DefaultPlugin;
    }
}

module.exports = {
    detect
}