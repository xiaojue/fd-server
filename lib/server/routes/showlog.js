/*
 * GET log page.
 */
var logger = require('../../log/logger.js');
var fs = require("fs");
var path = require("path");
var url = require("url");

exports.show = function(req, res) {
    logger.info("showlog请求: " + req.url);
    var gdata = url.parse(req.url, true).query;
    var len = gdata.len || 100;

    var data = rendLog(len);
    res.render("showlog", {
        title: 'fd-server log',
        content: data
    });

};

function rendLog(len) {
    var data = fs.readFileSync(path.resolve(__dirname , '../../../fdserver.log'), 'utf-8');
    var dataArr = data.split(/\n/g);
    var r = dataArr.slice( - len).join("\n");
    return r;
}
