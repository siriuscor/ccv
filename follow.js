const fs = require('fs-extra');
const child_process = require('child_process');
const exec = require('util').promisify(child_process.exec);

process.env.DEBUG = 'comtaku';
let followFile = process.argv[2] || 'followlist.txt';
async function follow(listFile) {
    let content = await fs.readFile(listFile);
    let lines = content.toString().split("\n");
    for(let line of lines) {
        let [name, url] = line.split(",");
        if (!name || !url) continue;
        download(name, url);
    }
}

async function download(name, url) {
    try {
        // let cmd = `D:\\tools\\nodejs\\node .\\cli.js -o ${name} ${url}`;
        // let args = ['.\\cli.js','-o',name,url]
        // console.log('execute', cmd);
        // child_process.spawnSync("D:\\tools\\nodejs\\node", args, {stdio: 'inherit'});
        child_process.fork('./cli.js', ['-o', name, url], {stdio: 'inherit'});
    }catch(e) {
        console.error(e);
    }
}

follow(followFile).catch(e => {
    console.error(e);
});

