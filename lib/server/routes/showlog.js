/*
 * GET log page.
 */
var log = require('../../log/logger.js');
var logger = log.getLogger("uipage");
var fs = require("fs");
var path = require("path");
var url = require("url");

exports.show = function(req, res) {
	logger.info("showlog请求: " + req.url);
	var gdata = url.parse(req.url, true).query;
	var op = gdata.op; //操作类型, 默认查看
	var conf = getConf();

	var c = gdata.c || "all";
	var len = gdata.len || 100;

	var data = rendLog(conf[c], len);
	res.render("showlog", {
		title: 'fd-server log',
		content: data
	});

};

function rendLog(file, len) {
	var data = fs.readFileSync(file, 'utf-8');
	var dataArr = data.split(/\n/g);
	var r = dataArr.slice( - len).join("\n");
	return r;
}

function getConf() {
	var logConfPath = path.join(__dirname, "../../log/_conf.json");
	var data = fs.readFileSync(logConfPath, 'utf-8');
	var result = {};
	var obj = JSON.parse(data);
	var appenders = obj.appenders;
	for (var i = 0; i < appenders.length; i++) {
		var item = appenders[i];
		if (item.type === "file") {
			var category = item.category instanceof Array ? item.category[0] : item.category;
			result[category] = item.filename;
		}
	}
	return result;
}

