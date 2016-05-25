var url = require('url');
var http = require('http');
var https = require('https');

var cache = {};
var retry_map = {};

var MAX_RETRY = 10;

function get(_url, extra_header, callback) {
    // if (cache[_url]) {
    //   callback(cache[_url]);
    //   return;
    // }

    console.log("request:" + _url);
    var options = url.parse(_url);
    options.headers = extra_header;
    // options.headers = {
        // 'referer': 'http://ac.qq.com/'
        // 'referer' : 'http://manhua.dmzj.com/'
        // 'Cookie' : 'JSESSIONID=zfpkXDTDycyzsM561JlLLQh48w33TYgGLq6Z6wRdR7sSsHpV4JCB'
    // };

    var c = options['protocol'] == 'http:' ? http : https;
    var req = c.get(options, (res) => {
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
// get('http://images.dmzj.com/y/%E9%93%B6%E6%B2%B3%E9%AA%91%E5%A3%AB%E4%BC%A0/%E7%AC%AC02%E5%8D%B7/Yhqsz02-004.jpg', console.log);
// get('http://ac.qq.com/Comic/searchList/search/onepiece');
// get('http://www.baid.cm', {}, console.log);
exports.get = get;
exports.getP = getP;
