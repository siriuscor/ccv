#!/usr/bin/env node
const program = require('commander');
const fs = require('fs-extra');
const {Comtaku} = require('./comtaku');
const path = require('path');

program
    .version('0.0.1')
    .option('-d, --debug', 'output extra debugging')
    .option('-c, --chapter', 'specify a chapter url')
    .option('-w, --worker <number>', 'parallel wokers number', 4)
    .option('-o, --output <dir>', 'output dir', '.')
    .option('-s, --search', 'search for comic name')
    .option('-r, --range <range>', 'specify chapter range', null)
    .option('--chrome', 'specify local chrome path')
    .arguments('<url>')
    .parse(process.argv);

(async () => {
    try {
        let opts = program.opts();
        if (!opts.chrome) opts.chrome = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        url = program.args[0];
        if (opts.debug) {
            opts = Object.assign(opts, {worker: 1, headless: false, slowMo: 200, devtools: true});
        }
        if (opts.output) opts.output = path.resolve(process.cwd(), opts.output);
        else opts.output = process.cwd();
        await fs.ensureDir(opts.output);
        opts.executablePath = opts.chrome;
        let otaku = new Comtaku();
        if (opts.search) {
            let list = await otaku.searchComic(url);
            console.table(list);
            return;
        }
        if (opts.chapter) {
            await otaku.browseChapter(url, opts);
        } else {
            await otaku.browseComic(url, opts);
        }
    }catch(e) {
        console.error(e);
        process.exit(1);
    }
})();

//./comtaku.js -o ../yaren https://manhua.fzdm.com/41/
//./cli.js -o ../gui https://www.manhuagui.com/comic/19430/
//node cli.js -o ../menghuan https://comic2.kukudm.com/comiclist/2236/index.htm

//https://www.mhgui.com/comic/30252/ 