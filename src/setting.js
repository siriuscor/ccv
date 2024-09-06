const fs = require('fs-extra');
const SETTING_PATH = 'setting.json';
const DEFAULT_SETTING = {
    concurrency: 4,
    debugMode: false,
    ext: 'cbz',
};

async function getSetting() {
    if (!await fs.exists(SETTING_PATH)) {
        return null;
    }
    let cur = JSON.parse(await fs.readFile(SETTING_PATH));
    return Object.assign({}, DEFAULT_SETTING, cur);
}

async function setSetting(setting) {
    let s = await getSetting();
    if (!s) s = DEFAULT_SETTING;

    let merge = {...s, ...setting};
    await fs.writeFile(SETTING_PATH, JSON.stringify(merge, null, 2));
    return merge;
}

async function checkSetting(setting) {
    if (!setting.basePath || !await fs.exists(setting.basePath)) {
        return false;
    }

    if (!setting.chromePath || !await fs.exists(setting.chromePath)) {
        return false;
    }
    return true;
}


module.exports = {get: getSetting, set:setSetting, check:checkSetting};