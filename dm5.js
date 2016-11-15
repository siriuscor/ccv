var request = require('./req');
var query = require('querystring');
var cheerio = require('cheerio');
var base = 'http://www.dm5.com';
var dm5 = {};
dm5.can = function(url) {
    return url.search(base) != -1;
}
dm5.search = function(name, callback) {
    var url = base + '/Comic/searchList/search/' +  query.escape(name);
    request.get(url, {}, (data) => {
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

dm5.comic_info = function(url, callback) {
    // url = base + url;
    request.get(url, {}, (data) => {
        var $ = cheerio.load(data);
        var items = $('.nr6 a');

        var name = $('h1').text().trim();
        var image = $('.innr91 img').attr('src');
        var author = $($('.innr92_m > a')[0]).text();
        var desp = $('.mhjj > p').text();
        var chapters = [];
        items.each(function(i, elem){
            var link = $(this).attr('href');
            if (link.startsWith('javascript') || link.startsWith('http')) return;
            var text = $(this).text();
            text = text.replace('“', '');
            text = text.replace(name + '漫画', '');
            chapters.push({'url':base + link, 'name':text.trim()});
        });

        callback({'name': name, 'url':url, 'image': image, 'author': author, 'desp' : desp, 'chapters': chapters.reverse()});
    });
};

dm5.chapter_info = function(url, callback) {
    // url = base + url;
    request.get(url, {}, (data) => {
        // var $ = cheerio.load(data);
        var match = data.match(/var DATA.+= \'(.+)\',/);
        // console.log(match[1]);
        var d = new Buffer(match[1].substr(1), 'base64');
        d = JSON.parse(d.toString());
        var pics = [];
        for(var i = 0; i < d.picture.length - 1; i++) {
            pics.push(d.picture[i]['url']);
        }

        callback({
            'url' : url,
            'name' : 'chapter',
            'pics' : pics
        });
    });
}

module.exports = dm5;

// dm5.search('海贼王', (comic) => {
    // console.log(comic);
    // dm5.comic_info(comic.url, console.log);
// });

dm5.comic_info('http://www.dm5.com/manhua-qumoshaonian/', console.log);
// dm5.chapter_info('http://ac.dm5.com/ComicView/index/id/493819/cid/1', console.log);