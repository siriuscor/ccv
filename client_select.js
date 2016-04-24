
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
            return list[i];
        }
    };
    return null;
}

exports.select = select;
