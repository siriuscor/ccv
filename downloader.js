var fs = require('fs'),os=require('os'),exec = require('child_process').exec,
    request = require('request');

function download(url, start, end) {
    var selector = require('./client_select');
    var client = selector.select(url);


    client.comic_info(url, (data) => {
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
    var targetPath = '/Users/user/Project/comic/' + path;

    var targetZip = targetPath + chapter.name + '.zip';
    if (fs.existsSync(targetZip)) {
      console.log('zip fle exist', targetZip);
      callback();
      return;
    }
    // if (fs.existsSync(targetPath)) return;
    var selector = require('./client_select');
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
                save_img(chapter_data.pics[j], tmp_dir + j + '.png', resolve, reject);
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

function save_img(uri, filename, callback, fail) {
  // request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    // request(url, {encoding: 'binary'}, function(error, response, body) {
    //     if (error) console.log(error);

    //     fs.writeFile(filename, body, 'binary', function (err) {

    //     });
    // });
    var body = {
      'url' : uri,
      'headers' : {
        'referer' : 'http://manhua.dmzj.com/'
      }
    };
//TODO: retry
    request(body).pipe(fs.createWriteStream(filename)).on('close', callback).on('error', function(err) {
      console.log(err);
      fail();
    });
  // });
}

download('http://manhua.dmzj.com/xdnydqs');
// download_chapter({'url':'http://www.fzdm.com/manhua/11/7/', 'name':'test'},'test', function() {
    // console.log('finish');
// });
// console.log(md5('123'));

// var p1 = new Promise(
//         // The resolver function is called with the ability to resolve or
//         // reject the promise
//         function(resolve, reject) {
//             // This is only an example to create asynchronism
//             setTimeout(
//                 function() {
//                     // We fulfill the promise !
//                     // resolve(thisPromiseCount);
//                     console.log('finish 1');
//                     resolve();
//                 }, 1000);
//         });
// p1 = p1.then(function() {
//     return new Promise(function(resolve, reject) {
//         setTimeout(
//                 function() {
//                     // We fulfill the promise !
//                     // resolve(thisPromiseCount);
//                     console.log('finish 2');
//                     resolve();
//                 }, 1000);
//     });
// });
// p1.then(function() {
//     return new Promise(function(resolve, reject) {
//     setTimeout(
//                 function() {
//                     // We fulfill the promise !
//                     // resolve(thisPromiseCount);
//                     console.log('finish 3');
//                     resolve();
//                 }, 1000);
//     });
// });
