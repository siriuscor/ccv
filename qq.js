var request = require('./req');
var query = require('querystring');
var cheerio = require('cheerio');
var base = 'http://ac.qq.com';
var qq = {};
qq.can = function(url) {
    return url.search(base) != -1;
}
qq.search = function(name, callback) {
    var url = base + '/Comic/searchList/search/' +  query.escape(name);
    request.get(url, (data) => {
        var $ = cheerio.load(data);
        var items = $('.mod_book_list > li');
        items.each(function(i, elem) {
            var html = $(this).html();
            var link = $('a', html).attr('href');
            var title = $('a', html).attr('title');
            var img = $('img', html).attr('data-original');
            callback({"url":link, "name":title, "image":img});
        });
    });
}

qq.comic_info = function(url, callback) {
    // url = base + url;
    request.get(url, (data) => {
        var $ = cheerio.load(data);
        var items = $('.chapter-page-all .works-chapter-item > a');
        var name = $('.works-intro-title').text();
        var image = $('.works-cover img').attr('src');
        var author = $('.works-intro-digi span:first-child').text();
        var desp = $('.works-intro-short').text();
        var chapters = [];
        items.each(function(i, elem){
            var link = $(this).attr('href');
            var text = $(this).text();
            text = text.replace('“', '');
            chapters.push({'url':base + link, 'name':text});
        });

        callback({'name': name, 'url':url, 'image': image, 'author': author, 'desp' : desp, 'chapters': chapters});
    });
};

qq.chapter_info = function(url, callback) {
    // url = base + url;
    request.get(url, (data) => {
        // var $ = cheerio.load(data);
        var match = data.match(/var DATA.+= \'(.+)\',/);
        // console.log(match[1]);
        var d = new Buffer(match[1].substr(1), 'base64');
        d = JSON.parse(d.toString());
        var pics = [];
        for(var i = 0; i < d.picture.length; i++) {
            pics.push(d.picture[i]['url']);
        }

        callback({
            'url' : url,
            'name' : 'chapter',
            'pics' : pics
        });
    });
}

module.exports = qq;

// qq.search('海贼王', (comic) => {
    // console.log(comic);
    // qq.comic_info(comic.url, console.log);
// });

// qq.comic_info('http://ac.qq.com/Comic/ComicInfo/id/530131', console.log);
// qq.chapter_info('http://ac.qq.com/ComicView/index/id/493819/cid/1', console.log);