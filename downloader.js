var fs = require('fs'),os=require('os'),exec = require('child_process').exec,
execSync = require('child_process').execSync,
    request = require('request'), co = require('co');
var selector = require('./client_select');

function download(url, start, end) {
    var client = selector.select(url);
    client.comic_info(url, (data) => {
        console.log("finish loading comic info", data);
        data.name = data.name.replace('/', '-');

        start = start || 0;
        end = end || data.chapters.length;
        end = Math.min(end, data.chapters.length);
        //multi-thread
        function recur(i) {
            if (i >= end) return;
            download_chapter(data.chapters[i], '/Users/user/Pictures/' + data.name + '/', function() {
                recur(i + 1);
            });
        }
        recur(start);
    });
}

function e(cmd) {
    console.log(cmd);
    exec(cmd, function(err, stdin, stdout) {
        if (err) console.log(err);
    });
}
var crypto = require('crypto');
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

function download_chapter(chapter, path, callback) {
co(function*() {
    var targetPath = path;
    if (!fs.existsSync(targetPath)) execSync('mkdir -p "' + targetPath + "\"");
    var targetZip = targetPath + chapter.name + '.zip';
    if (fs.existsSync(targetZip)) {
      console.log('skip exist zip fle', targetZip);
      callback();
      return;
    }

    chapter.name = chapter.name.replace('/', '-');
    var client = selector.select(chapter.url);
    var tmp_dir = '/tmp/' + md5(chapter.url) + '/';

    if (!fs.existsSync(tmp_dir)) execSync('mkdir \'' + tmp_dir+"'");
    console.log('mk temp', tmp_dir, chapter.url);
    var chapter_data = yield client.chapter_info_p(chapter.url);
    var r = require('./req');
    var total = chapter_data.pics.length;
    var ProgressBar = require('progress');

    var bar = new ProgressBar('downloading ' + chapter.name +' :percent [:bar]', { 
        complete: '=',
        incomplete: ' ',
        width : 50,
        total: total });

    var worker = 1;

    function t(arr, start) {
        if (arr.length == 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
            co(function*() {
                for(var i = 0;i < arr.length; i++) {
                    // console.log("save ", (start+i));
                    yield client.save_img(arr[i], tmp_dir + (start+i) + '.png')
                    bar.tick();
                }
                resolve();
            }).catch(reject);
        })
    }

    // var per_count = parseInt((total + worker - 1) / worker);
    // console.log("compute", total, per_count);
    // var arr = [];
    // for(var i = 0; i < worker; i++) {
    //     // console.log("count2", i*worker, per_count);
    //     arr.push(t(chapter_data.pics.slice(i*per_count, i*per_count+per_count), i*per_count));
    // }
    // yield arr;
    for(var j = 0; j < total; j = j+worker) {
        var arr = [];
        for(var p = 0; p < worker; p++) {
            if (j+p < total) {
                // console.log("process", (j+p));
                arr.push(client.save_img(chapter_data.pics[j+p], tmp_dir + (j+p) + '.png'))
            }
        }
        // console.log('length', arr.length);
        // yield client.save_img(chapter_data.pics[j], tmp_dir + j + '.png');
        // console.log(chapter.name, (j+1) + '/' + total);
        yield arr;
        bar.tick(worker);
    }

    console.log("begin compress");
    // var cmd = 'cd ' + tmp_dir + ' ;zip \'' + chapter.name + '.zip\' *.png;mv \'' + tmp_dir + chapter.name + '.zip\' ' + targetZip + ';rm -rf '+ tmp_dir;
    // console.log("cmd", cmd);
    exec('cd ' + tmp_dir + ' ;zip \'' + chapter.name + '.zip\' *.png;mv \'' + tmp_dir + chapter.name + '.zip\' \'' + targetZip + '\';rm -rf '+ tmp_dir,
        function(err, stdout,stderr) {
            console.log(stdout, stderr);
            callback();
        });
}).catch(console.error);
}


process.on('uncaughtException', (err) => {
  console.log('uncaught', err);
  console.log('stack', err.stack);
  process.exit(1);
});
// var client = selector.select('http://manhua.dmzj.com');
// client.save_img("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/28/GGS28_094.jpg", "1.jpg")
// save_img("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg1", "1.jpg", console.log, console.log);

download('http://manhua.fzdm.com/28/');//, 5, 35);
// download_chapter({'url':'http://manhua.dmzj.com/yybsyuyuhakusho/10503.shtml', 'name':'第19卷'}, '/Users/user/Pictures/幽游白书/', function() {
//     console.log('finish');
// });

