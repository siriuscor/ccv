var url = require('url');
var http = require('http');

var cache = {};
function get(_url, callback) {
    // var postData = querystring.stringify({
    //   'msg' : 'Hello World!'
    // });
    if (cache[_url]) {
      callback(cache[_url]);
      return;
    }

    console.log("request:" + _url);
    var options = url.parse(_url);
    options.headers = {
        // 'referer': 'http://ac.qq.com/'
        // 'referer' : 'http://manhua.dmzj.com/'
    };

    var req = http.get(options, (res) => {
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
            callback(null);
            return;
        }
        cache[_url] = text;
        callback(text);
        // console.log('No more data in response.')
      })
    });

    req.on('error', (e) => {
      // console.log("req on error", e);
      callback(null, e);
      // console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    // req.write(postData);
    // req.end();
}

// get('http://images.dmzj.com/y/%E9%93%B6%E6%B2%B3%E9%AA%91%E5%A3%AB%E4%BC%A0/%E7%AC%AC02%E5%8D%B7/Yhqsz02-004.jpg', console.log);
// get('http://ac.qq.com/Comic/searchList/search/onepiece');
// get('http://www.baidu.com', console.log);
exports.get = get;
