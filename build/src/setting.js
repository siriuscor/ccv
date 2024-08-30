const fs = require('fs-extra');
const SETTING_PATH = 'setting.json';
const SAMPLE_SETTING_PATH = __dirname + '/setting-sample.json';

async function getSetting() {
    if (!await fs.exists(SETTING_PATH)) {
        return null;
    }
    return JSON.parse(await fs.readFile(SETTING_PATH));
}

async function setSetting(setting) {
    let s = await getSetting();
    if (!s) s = JSON.parse(await fs.readFile(SAMPLE_SETTING_PATH));

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