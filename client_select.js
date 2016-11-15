var qq = require('./qq');
var fzdm = require('./fzdm');
var dmzj = require('./dmzj');
var list = [
    qq,
    fzdm,
    dmzj
];

function select(url) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].can(url)) {
            return enchant(list[i]);
        }
    };

    console.error("not found client for ", url);
    return null;
}


function enchant(client) {
    client.comic_info_p = (url) => {
        return new Promise(function(resolve, reject) {
            client.comic_info(url, (chapter_data) => {
                if (chapter_data == null) reject();
                resolve(chapter_data);
            })
        })
    };

    client.chapter_info_p = (url) => {
        return new Promise(function(resolve, reject) {
            client.chapter_info(url, (data) => {
                if (data) resolve(data);
                else reject();
            })
        });
    };

    // if (!client.save_img) client.save_img = function(url, file) {
    //     return require('./req').save_img(url, {}, file);
    // }

    return client;
}

exports.select = select;
