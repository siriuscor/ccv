var express = require('express');
var url = require('url');
var http = require('http');
var request = require('request');
// console.log(request);
var selector = require('./client_select');
var querystring = require('querystring');

var app = express();

var comic_client;

var router = express.Router();
// router.use(function create_client(req, res, next) {
  // var ch = req.query.ch || 'qq';
  // comic_client = require('./' + ch);
  // next();
// });

// var qq = require('./qq');
// var client = qq;
router.get('/', (req,res) => {
    res.set('Content-Type', 'text/html');
    res.send('<form action="/comic" method="get"><input name="comic" type="text"/><input type="submit"/></form>');
});

router.get('/comic', (req, res) => {
    var comic = req.query.comic;
    var client = selector.select(comic);
    // console.log("comic query", comic);
    res.set('Content-Type', 'text/html');
    client.comic_info(comic, function(comic_data) {
        for (var i = 0; i < comic_data.chapters.length; i++) {
            var chapter = comic_data.chapters[i];
            var hash = querystring.stringify({v: chapter['url'],p:1,n:chapter['name'],
                            comic: comic_data['url']});
            res.write(`<a href="/static/#${hash}">${chapter['name']}</a><br>`);
        }

        res.end();
    });
});

router.get('/next', (req, res) => {
    var comic = req.query.comic;
    var v = req.query.v;
    var client = selector.select(comic);
    client.comic_info(comic, function(comic_data) {
        var chapters = comic_data.chapters;
        for (var i = 0; i < chapters.length; i++) {
            // console.log('compare ', chapters[i], v);
            if (chapters[i]['url'] == v && chapters[i+1] != undefined) {
                // console.log('return ', chapters[i + 1])
                res.send(chapters[i+1]);
                return;
            }
        };

        res.send({url:null, name:null});
    });
});

router.get('/read', (req, res) => {

});

router.get('/chapter', function (req, res) {
    var v = req.query.v;
    var client = selector.select(v);
    // v = '/ComicView/index/id/530131/cid/137';
    client.chapter_info(v, function(chapter_data){
        res.send(chapter_data);
    });
});

app.get('/proxy', function(req, res) {
    var link = req.query.url;
    request(link).pipe(res);
});

app.use('/static', express.static('static'));
app.use('/', router);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});