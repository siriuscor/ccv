var request = require('./req');
var query = require('querystring');
var cheerio = require('cheerio');
var base = 'http://manhua.fzdm.com';
var c = {};
//http://www.fzdm.com/manhua/11/
c.can = function(url) {
    return url.search(base) != -1;
}
c.search = function(name, callback) {
    // var url = base + '/Comic/searchList/search/' +  query.escape(name);
    // request.get(url, (data) => {
    //     var $ = cheerio.load(data);
    //     var items = $('.mod_book_list > li');
    //     items.each(function(i, elem) {
    //         var html = $(this).html();
    //         var link = $('a', html).attr('href');
    //         var title = $('a', html).attr('title');
    //         var img = $('img', html).attr('data-original');
    //         callback({"url":link, "name":title, "image":img});
    //     });
    // });
    callback(null);
}

c.comic_info = function(url, callback) {
    request.get(url, {}, (data) => {
        var $ = cheerio.load(data);
        var items = $('.pure-u-1-2 > a');
        var name = $('#content h2').html();
        name = name.replace(/&#x([\d\w]{4});/gi, function (match, grp) {
                return String.fromCharCode(parseInt(grp, 16)); } );
        var image = $('.pure-g > content > img').attr('src');
        var author = '';
        var desp = '';
        var chapters = [];
        items.each(function(i, elem){
            var link = $(this).attr('href');
            var text = $(this).text();
            chapters.push({'url':url + link, 'name':text});
        });
        chapters = chapters.reverse();
        callback({'name': name, 'url':url, 'image': image, 'author': author, 'desp' : desp, 'chapters': chapters});
    });
};

c.chapter_info = function(url, callback) {
    //TODO:multiX10
    // request.get(url, (data) => {
        // var $ = cheerio.load(data);
        // var pages = $('.navigation > a');
        // var promise = [];
        // if (cache[url]) {
            // callback(cache[url]);
            // return;
        // }
        var pics = [];
        // var index = 0;
        var ret = {'url' : url, 'pics' : pics};

        function get2page(url, i) {
            // url = url + 'index_' + i + '.html';
            request.get(url + 'index_' + i + '.html', {}, (data) => {
                if (data == null || data == 'Not Found') {
                    // cache[url] = ret;
                    // console.log('callback start');
                    callback(ret);
                    return;
                }

                var $ = cheerio.load(data);
                var pic = $('#mhpic').attr('src');
                var pic1 = $('#mhpic1').attr('src');
                if (pic == undefined) {
                    callback(ret);
                    return;
                }
                pics.push(pic);
                if (pic1 == undefined || pic1.search('undefined') != -1) {
                    // cache[url] = ret;
                    // console.log('callback undefine');
                    callback(ret);
                    return;
                }
                pics.push(pic1);
                get2page(url, i + 2);
            });
        }

        get2page(url, 0);
        // pages.each(function(i, elem) {
        //     var page = url + $(this).attr('href');
        //     console.log(page);
        //     promise.push(new Promise(function(resolve, reject) {
        //         request.get(page, (data) => {
        //             var $ = cheerio.load(data);
        //             var pic = $('#mhpic').attr('src');
        //             pics.push(pic);
        //             resolve();
        //         });
        //     }));
        // });

        // Promise.all(promise).then(function() {
        //     callback(pics);
        // });
    // });
    // url = base + url;
    // request.get(url, (data) => {
    //     // var $ = cheerio.load(data);
    //     var match = data.match(/var DATA.+= \'(.+)\',/);
    //     // console.log(match[1]);
    //     var d = new Buffer(match[1].substr(1), 'base64');
    //     d = JSON.parse(d.toString());
    //     var pics = [];
    //     for(var i = 0; i < d.picture.length; i++) {
    //         pics.push(d.picture[i]['url']);
    //     }

    //     callback({
    //         'url' : url,
    //         'name' : 'chapter',
    //         'pics' : pics
    //     });
    // });
};

module.exports = c;

// qq.search('海贼王', (comic) => {
    // console.log(comic);
    // qq.comic_info(comic.url, console.log);
// });

// c.comic_info('http://manhua.fzdm.com/39/', console.log);
// c.chapter_info('http://manhua.fzdm.com/39/qz42/', console.log);