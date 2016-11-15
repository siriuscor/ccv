var url = require('url');
var http = require('http');
var https = require('https');
var request = require('request');


var cache = {};
var retry_map = {};

var MAX_RETRY = 10;

function get(_url, extra_header, callback) {
    // if (cache[_url]) {
    //   callback(cache[_url]);
    //   return;
    // }

    console.log("request:" + _url);

    var options = {
        url : _url,
        headers : extra_header,
    }
    // var options = url.parse(_url);
    // options.headers = extra_header;
    // options.headers = {
        // 'referer': 'http://ac.qq.com/'
        // 'referer' : 'http://manhua.dmzj.com/'
        // 'Cookie' : 'JSESSIONID=zfpkXDTDycyzsM561JlLLQh48w33TYgGLq6Z6wRdR7sSsHpV4JCB'
    // };
    // console.log(options);
    request(options, (error, response, body) => {
        callback(body);
    });

    return;
    var c = options['protocol'] == 'http:' ? http : https;
    console.log(options);
    var req = request(options, (res) => {
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      var text = "";
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`);
        text += chunk;
      });
      res.on('end', () => {
        if (text == '') {
            console.error('request empty body');
            // callback(null);
            retry(_url, extra_header, callback);
            return;
        }
        cache[_url] = text;
        callback(text);
        // console.log('No more data in response.')
      })
    });

    req.on('error', (e) => {
      console.log("req on error", e);
    //   callback(null, e);
      retry(_url, extra_header, callback);
      // console.error(`problem with request: ${e.message}`);
    });
    req.setTimeout(10000);
    // write data to request body
    // req.write(postData);
    // req.end();
}

function getP(_url , extra_header) {
    return new Promise(function(resolve, reject) {
        get(_url, extra_header, function(data) {
            if (data == null) {
                reject();
            } else {
                resolve(data);
            }
        });
    });
}

function retry(_url ,extra_header, callback) {
    if (retry_map[_url] == undefined) retry_map[_url] = 0;
    retry_map[_url] ++;
    // console.log(retry_map);
    if (retry_map[_url] > MAX_RETRY) {
        console.log('retry max reach');
        callback(null);
    } else {
        get(_url, extra_header, callback);
    }
}

function save_img(url, extra_header, file) {
    return new Promise(function(resolve, reject) {
        var body = {
            'url' : url,
            'headers' : extra_header
        };
        
        console.log("save img", url, file);
        var request = require('request');
        var fs = require('fs');

        request
        .get(body)
        .on('response', function(response) {
            if (response.headers['content-type'] == 'text/html' || response.statusCode != 200){
                reject("fatal error");
            }
        })
        .on('error', reject)
        .on('end', resolve())
        .pipe(fs.createWriteStream(file))
    });
}

function retry(maxRetries, fn) {
  return fn().catch(function(err) { 
    if (maxRetries <= 0) {
      throw err;
    }
    return retry(maxRetries - 1, fn); 
  });
}

var co = require('co');
function save_img_retry(url, extra_header, file) {
    return new Promise((resolve, reject) => {
    co(function*() {
        for(var i = 0;i < 3; i ++) {
            try{
                yield save_img(url, extra_header, file);
                resolve();
                // return;
            }catch(e) {
                console.log("retry",i, url);
            }
        }
        reject("retry max");
    }).catch((err) => {
        console.log('catch outside');
        reject(err);
    })
       
    });
}
// get('http://images.dmzj.com/y/%E9%93%B6%E6%B2%B3%E9%AA%91%E5%A3%AB%E4%BC%A0/%E7%AC%AC02%E5%8D%B7/Yhqsz02-004.jpg', console.log);
// get('http://ac.qq.com/Comic/searchList/search/onepiece');
// get('http://www.baid.cm', {}, console.log);
// co(function*() {
//     yield save_img_retry("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg", {
//         'referer' : 'http://manhua.dmzj.com/'
//       }, "1.jpg");
//       yield save_img("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg", {
//         'referer' : 'http://manhua.dmzj.com/'
//       }, "2.jpg");
//       yield save_img("http://images.dmzj.com/j/%E7%BB%93%E7%95%8C%E5%B8%88/Vol_02/GGS02_000.jpg", {
//         'referer' : 'http://manhua.dmzj.com/'
//       }, "3.jpg");
// }).catch(console.error);


exports.get = get;
exports.getP = getP;
exports.save_img = save_img_retry;
exports.save_img_raw = save_img;
