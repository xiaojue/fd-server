/*
 * config listing.
 */

var log = require('../../log/logger.js');
var logger = log.getLogger("uipage");
var path = require('path');
var fs = require("fs");

var vhosts = {
	localConfig: path.resolve(__dirname, '../../../', 'localConfig.json'),
	config: path.resolve(__dirname, '../../../', 'config.json')
};

function modify(config, json, res) {
	fs.writeFileSync(config, JSON.stringify(json));
	res.send('(\'{"message": "successful"}\')');
}

exports.list = function(req, res) {

	var data, type = req.body.type,
	local = req.body.local;

	if (local === "s") {
		data = fs.readFileSync(vhosts.localConfig, 'utf-8');
		var localJson = JSON.parse(data);
		//添加规则host
		if (type === "sh") localJson.vhost = JSON.parse(req.body.sh);
		//添加代理规则保存
		if (type === "sp") localJson.proxy = JSON.parse(req.body.sp);
		//添加代理规则组名字
		if (type === "sn") localJson.name = req.body.sn === '0' ? [] : req.body.sn;
		//创建代理规则组
		if (type === "addGroup") localJson.proxy = JSON.parse(req.body.ag);
		//每删除一条host
		if (type === "dh") delete localJson.vhost[req.body.dh];
		modify(vhosts.localConfig, localJson,res);
	} else {
		data = fs.readFileSync(vhosts.config, 'utf-8');
		var json = JSON.parse(data);
		/*服务器配置*/
		// 每添加一条规则，更新配置文件
		if (type === "sh") json.vhost = JSON.parse(req.body.sh);
		//每删除一条规则更新配置文件
		if (type === "dh") delete json.vhost[req.body.dh];
		//禁用某条规则
		if (type === "disable") delete json.vhost[req.body.disrule];
		if (type === "openProxy") json.proxy = req.body.rule;
		if (type === "cancelProxy") json.proxy = req.body.rule === "1" ? [] : req.body.rule;
		modify(vhosts.config, json,res);
	}
};

