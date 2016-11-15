var fs = require('fs'),os=require('os'),exec = require('child_process').exec,
    request = require('request'), co = require('co');
var selector = require('./client_select');

function download(url, start, end) {
    var client = selector.select(url);
    client.comic_info(url, (data) => {
        console.log("finish loading comic info", data.chapters.length);
        // console.log(data);
        // process.exit(0);
        data.name = data.name.replace('/', '-');
        e('mkdir \'' + data.name + '\'');
        // fs.mkdirSync(data.name);

        start = start || 0;
        end = end || data.chapters.length;
        end = Math.min(end, data.chapters.length);
        //multi-thread
        function recur(i) {
            // console.log('in recur ', i);
            if (i >= end) return;
            //TODO:check already exists
            download_chapter(data.chapters[i], data.name + '/', function() {
                recur(i + 1);
            });
        }
        // var i = 0;
        recur(start);
        // download_chapter(data.chapters[i], data.name + '/', resolve);
        // var p = new Promise(function(resolve, reject){
        //     console.log('begin download');
        //     resolve();
        // });
        // for (var i = 0; i < data.chapters.length; i++) {
        //     p = p.then(function() {
        //         return new Promise(function(resolve, reject) {
        //             download_chapter(data.chapters[i], data.name + '/', resolve);
        //         });
        //     });
        // }
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
    var targetPath = __dirname + path;

    var targetZip = targetPath + chapter.name + '.zip';
    if (fs.existsSync(targetZip)) {
      console.log('zip fle exist', targetZip);
      callback();
      return;
    }

    chapter.name = chapter.name.replace('/', '-');
    var client = selector.select(chapter.url);

    console.log('downloading', chapter.name);
    var tmp_dir = '/tmp/' + md5(chapter.url) + '/';

    var promise = [];
    exec('mkdir ' + tmp_dir);
    client.chapter_info(chapter.url, function(chapter_data) {
        for(var j = 0; j < chapter_data.pics.length; j++) {
            console.log(chapter_data.pics[j]);
            promise.push(new Promise(function(resolve, reject) {
                // client.save_img(chapter_data.pics[j], tmp_dir + j + '.png', resolve, reject);
            }));
        }
        Promise.all(promise).then(function(){
            console.log("begin compress");
            exec('cd ' + tmp_dir + ' ;zip \'' + chapter.name + '.zip\' *.png;mv \'' + tmp_dir + chapter.name + '.zip\' ' + targetPath + ';rm -rf '+ tmp_dir,
                function(err, stdout,stderr) {
                    console.log(stdout);
                    callback();
                });
        }).catch(function(err) {
            console.log(err);
        });
    });
}

// save_img("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg1", "1.jpg", console.log, console.log);
co(function*() {
    // save_img_retry("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg", {
        // 'referer' : 'http://manhua.dmzj.com/'
    //   }, "1.jpg").catch(console.log);


    var chapter = {'url':'http://manhua.dmzj.com/yybsyuyuhakusho/10503.shtml', 'name':'第19卷'};
    var path = '/yybs';

    var targetPath = __dirname + path;
    exec('mkdir -p ' + targetPath);
    var targetZip = targetPath + chapter.name + '.zip';
    if (fs.existsSync(targetZip)) {
      console.log('zip fle exist', targetZip);
      callback();
      return;
    }

    chapter.name = chapter.name.replace('/', '-');
    var client = selector.select(chapter.url);

    console.log('downloading', chapter.name);
    var tmp_dir = '/tmp/' + md5(chapter.url) + '/';

    exec('mkdir ' + tmp_dir);
    var chapter_data = yield client.chapter_info_p(chapter.url);
    console.log(chapter_data);
    var r = require('./req');
    for(var j = 0; j < chapter_data.pics.length; j++) {
        console.log(chapter_data.pics[j]);
        yield client.save_img(chapter_data.pics[j], tmp_dir + j + '.png');
    }

    console.log("begin compress");
    exec('cd ' + tmp_dir + ' ;zip \'' + chapter.name + '.zip\' *.png;mv \'' + tmp_dir + chapter.name + '.zip\' ' + targetPath + ';rm -rf '+ tmp_dir,
        function(err, stdout,stderr) {
            console.log(stdout);
            // callback();
        });

}).catch(console.error);
// download('http://manhua.dmzj.com/jjs', 5, 35);
// download_chapter({'url':'http://manhua.dmzj.com/yybsyuyuhakusho/10503.shtml', 'name':'第19卷'},'幽游白书', function() {
//     console.log('finish');
// });

