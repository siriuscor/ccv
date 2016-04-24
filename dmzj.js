var request = require('./req');
var query = require('querystring');
var cheerio = require('cheerio');
var u = require('url');
var base = 'http://manhua.dmzj.com';
// http://manhua.dmzj.com/chaonenglizheqimunanxiongdezainan
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
    request.get(url, (data) => {
        // var name = data.match(/var g_comic_name = "(.+)";/);
        // name = name[1];

        var $ = cheerio.load(data);
        var name = $('.anim_title_text').text();
        var image = $('.anim_intro_ptext img').attr('src');
        var author = $('.anim-main_list td').eq(2).text();
        var desp = $('.line_height_content').text();
        var items = $('.cartoon_online_border a');
        // console.log(name, image, author);
        var chapters = [];
        items.each(function(i, elem){
            var link = $(this).attr('href');
            var text = $(this).text();
            chapters.push({'url':u.resolve(url, link), 'name':text});
        });
        // chapters = chapters.reverse();
        callback({'name': name, 'url':url, 'image': image, 'author': author, 'desp' : desp, 'chapters': chapters});
    });
};

c.chapter_info = function(url, callback) {
    request.get(url, (data) => {
        // var $ = cheerio.load(data);
        var match = data.match(/eval\(function(.+)\)/);
        // console.log(match[1]);
        var image_site = 'http://images.dmzj.com';
        eval('var a = function b' + match[1]);
        eval(a);
        var b = eval(pages);
        var pics = [];
        for(var i = 0; i < b.length; i++) {
            pics.push(u.resolve(image_site, b[i]));
        }
        callback({
            'url' : url,
            'name' : 'chapter',
            'pics' : pics
        });
    });
};

module.exports = c;

// c.comic_info('http://manhua.dmzj.com/xdnydqs', console.log);
// c.chapter_info('http://manhua.dmzj.com/xdnydqs/19528.shtml', console.log);
