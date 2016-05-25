'use strict';
var request = require('./req');
var cheerio = require('cheerio');
var u = require('url');
var requ = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');


var header = {'Cookie' : 'JSESSIONID=6Tr0XFCPwC5lh46MpVy1vQNDcSXBrpMCX56L7rTx2DrgccQgdkyp'};

var p = Promise.resolve();
function chain(func) {
    p = p.then(() => {
        return new Promise(func);
    });
}


function crawl(title, url, callback) {
let tt = title;
console.log("start crawling ", title, url);
// var prom = Promise.resolve();

request.get(url, header, (data) => {
    // console.log(data);
    // if (!fs.existsSync(title)) {
    //     e('mkdir -p "' + title + '"');
    // }

    var $ = cheerio.load(data);
    var items = $('.closed a');
    var path_item = [];
    var p = $('.base');
    p.each(function(i, elem) {
        path_item.push($(this).text().replace(/\//g, '-'));
    });
    path_item.push($('.item').text().replace(/\//g, '-'));

    var path = path_item.join('/');
    console.log('path ', path);
    if (!fs.existsSync(path)) {
        // e('mkdir -p "' + path + '"');
        chain(function(resolve, reject){
            exec('mkdir -p "' + path + '"', function(err, stdin, stdout) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    e('echo "' + url + '" >> 2.txt');
/*
    var down = $('.search-result .table-title a');
    // console.log(name, image, author);

    down.each(function(i, elem) {
        var link = $(this).attr('href');
        var text = $(this).text().trim();
        text = text.replace(/\//g, '-');
        link = u.resolve(url, link) + '&redirect=false&doDownload=true';
        console.log("--------------");
        // console.log("file", title + "/" + text + '.txt');
        console.log("file", path + "/" + text + ".txt");
        console.log('link', link);

        var body = {
          'url' : link,
          'headers' : header
        };

        chain(function(resolve, reject) {
            fs.writeFile(path + "/" + text + '.txt', link, (err) => {
                 if (err) {
                    console.log(err);
                    //   errorlist[title + "/" + text + '.txt'] = link;
                    // fs.writeFile(path + "/" + text + '.txt', link, (err) => {
                        console.log("-----err:", path + "/" + text + '.txt', link);
                    // });
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // prom.then(new Promise(resolve, reject) {
        //     var body = {
        //       'url' : link,
        //       'headers' : header
        //     };
        //     request(body).pipe(fs.createWriteStream(filename)).on('close', resolve).on('error', function(err) {
        //       console.log(err);
        //     });
        // });
    });
*/
    items.each(function(i, elem){
        let link = $(this).attr('href');
        let text = $(this).text();
        let sub_url = u.resolve(url, link);
        if (sub_url == url) return;

        text = text.trim();
        text = text.replace(/\//g, '-');
        // text = text.replace(/'/g, '\\\'');
        console.log('from title', tt);
        console.log("sub titles", text, sub_url);
        // chain(function(resolve, reject) {
            crawl(tt + "/" + text, sub_url);
        // });

        // crawl(title, sub_url);
        // chapters.push({'url':sub_url, 'name':text});
    });

    // chain(function(resolve, reject){
    //     console.log('end crawling ', title, url);
    //     callback();
    //     resolve();
    // });
    // prom.then(new Promise(function(resolve, reject){
    //     console.log('end crawling ', title, url);
    //     callback();
    //     resolve();
    // }));

    // console.log(chapters);
    // chapters = chapters.reverse();
    // callback({'name': name, 'url':url, 'image': image, 'author': author, 'desp' : desp, 'chapters': chapters});
});
}

function e(cmd) {
    console.log(cmd);
    exec(cmd, function(err, stdin, stdout) {
        if (err) console.log(err);
    });
}

var a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=4';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=51617';
// url = "https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=7031";
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=49869';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=117';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=7580';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=20438';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=20439';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=20480';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=9881';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=9060';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=8630';
// url = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=8636';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=51695';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=66457';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=2742';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=7031';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=52469';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=52737';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=40712';
// a = 'https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=79577';
// crawl("root", a, console.log);

// crawl("test", a);
// fs.writeFileSync('root/Power Management/DC-DC Power Regulators/88PG867/88PG839 Reference Schematic and Layout with Components on the Same Layer as IC (.zip).txt',' https://extranet.marvell.com/extranet/dms/download-document.do?id=171882&groupID=4&subGroupID=18717&redirect=false&doDownload=true');

// var co = require('co');
// // var thunkify = require('thunkify');
// co(function *(){
//   // resolve multiple promises in parallel
//   var a = request.getP("http://bid123123u.cm", {});
//   var b = request.getP("https://baidu.com", {});
//   var c = request.getP("https://baidu.com", {});
//   var res = yield [a, b, c];
//   console.log(res);
//   // => [1, 2, 3]
// }).catch(console.log);

function chain_list(list, process, callback) {
    let a = Promise.resolve();
    for (let i = 0; i < list.length; i++) {
        a = a.then(() => {
            return new Promise(function(resolve, reject){
                console.log("processing " + i + '/' + list.length);
                process(list[i], resolve)}
            );
        });
    }

    if (callback) a.then(callback);

}

function downloadPage(url, callback) {
    request.get(url, header, (data) => {
        var $ = cheerio.load(data);
        var path_item = [];
        var p = $('.base');
        p.each(function(i, elem) {
            path_item.push($(this).text().replace(/\//g, '-'));
        });
        path_item.push($('.item').text().replace(/\//g, '-'));

        var path = path_item.join('/');
        console.log('path ', path);

        var down = $('.search-result .table-title a');
        // console.log(name, image, author);

        var filelist = [];
        down.each(function(i, elem) {
            var link = $(this).attr('href');
            var text = $(this).text().trim();
            text = text.replace(/\//g, '-');
            link = u.resolve(url, link) + '&redirect=false&doDownload=true';
            // console.log("--------------");
            // console.log("file", title + "/" + text + '.txt');
            // console.log("file", path + "/" + text + ".txt");
            // console.log('link', link);
            filelist.push([path, link, text]);
        });

        chain_list(filelist, function(item,resolve) {
            downloadFile(item, resolve);
        }, callback);
        // callback(filelist);
    });
}

function downloadFile(param, callback) {
    var path = param[0];
    var url = param[1];
    var text = param[2];
    // var regexp = /filename=\"(.*)\"/gi;
    // console.log('file', path, text);
    // console.log('url', url);
    console.log("--------------");
    console.log("download", path, url);
    var body = {
      'url' : url,
      'headers' : header
    };
    // initiate the download
    mkdirp(path, function (err) {
        var req = requ.get(body)
                         .on('response', function( res ){
                            //  console.log(res.headers);
                            // extract filename
                            var att = res.headers['content-disposition'];
                            if (res.headers['set-cookie'] != undefined) {
                                header['Cookie'] = res.headers['set-cookie'][0];
                            }
                            if (att == undefined) {
                                console.error('---err download', path, url);
                                callback();
                                return;
                            }
                            var filename = att.substr(att.indexOf('filename=')+9)
                            console.log("write file", filename);
                            // if (fs.existsSync(path + '/' + filename)){
                            //     callback();
                            //     return;
                            // };
                            // var filename = regexp.exec( res.headers['content-disposition'] )[1];
                            // create file write stream
                            var fws = fs.createWriteStream( path + '/' + filename );

                            var total = 0;
                            var bytes_count = 0;
                            var count_interval = 1000;
                            var count_ref = setInterval(function(){
                                // console.log('speed ' + (bytes_count / 8 / count_interval) + ' KB/s');
                                process.stdout.write('\x1B[0G');
                                process.stdout.write('speed ' + (bytes_count / 8 / count_interval).toFixed(2) + ' KB/s, total:' + total.toLocaleString() + ' bytes          ');
                                bytes_count = 0;
                            }, count_interval);
                            // setup piping
                            res.pipe( fws );
                            res.setTimeout(10 * 60 * 1000);
                            res.on('data', (chunk) => {
                            //   console.log('got %d bytes of data', chunk.length);
                                bytes_count += chunk.length;
                                total += chunk.length;
                            });
                            res.on('error', function(err) {
                                console.error(err);
                                console.error('---err download', path, url);
                                clearInterval(count_ref);
                                callback();
                            });
                            res.on('end', function(){
                                console.log("\ndownload "+filename+" ok");
                                clearInterval(count_ref);
                                callback();
                            });
                         });
    });

}


var p = Promise.resolve();
function chain(func) {
    p = p.then(() => {
        return new Promise(func);
    });
}

var urls = fs.readFileSync('3.txt');
urls = Array.from(new Set(urls.toString().split("\n")));
// console.log(urls);

// fs.writeFileSync('3.txt', urls.join("\n"));
// 80954
// urls = ['https://extranet.marvell.com/extranet/dms/documents.do?groupID=4&subGroupID=52587'];

chain_list(urls, function(item, resolve){
    console.log('enter', item);
    downloadPage(item, resolve);
});

// downloadFile(['My Products/Tools/Marvell GNU Tools/MGCC-4.6-CVE-2015-7547-fixed', 'https://extranet.marvell.com/extranet/dms/download-document.do?id=175990&groupID=4&subGroupID=80954&redirect=false&doDownload=true', 'ttt'], console.log);
// for (let i = 0; i < urls.length; i++) {
//     chain(function(resolve, reject){
//             console.log("enter",i);
//             downloadPage(urls[i], resolve);
//     });
// }
