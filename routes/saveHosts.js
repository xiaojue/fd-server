
/*
 * config listing.
 */

exports.list = function(req, res){
	var logger = require('../lib/log/logger.js').getLogger("uipage");
	var path = require('path');
	var fs = require("fs");

	var vhosts = {
	    localConfig: path.resolve(__dirname, '../', 'localConfig.json'),
	    config:path.resolve(__dirname, '../', 'config.json')
	};

	if(req.body.local === "s"){
		var localJson;
		fs.readFile(vhosts.localConfig,'utf-8', function (err, data) {
			if(err){
				logger.error(err);
			}else{
				if(data){
					logger.info(data);
					var localJson = JSON.parse(data);
				}else{
					localJson = {};
				}
			}
			//添加规则host
			if(req.body.type === "sh"){
				localJson.vhost = JSON.parse(req.body.sh);
				modifyLocalConfig();
			}

			//添加代理规则保存
			if(req.body.type === "sp"){
				localJson.proxy = JSON.parse(req.body.sp);
				modifyLocalConfig();
			}

			//添加代理规则组名字
			if(req.body.type === "sn"){
				localJson.name = req.body.sn;
				modifyLocalConfig();
			}

			//每删除一条host
			if(req.body.type === "dh"){
				delete localJson.vhost[req.body.dh]
				modifyLocalConfig();
			}

			function modifyLocalConfig(){
				fs.writeFile(vhosts.localConfig, JSON.stringify(localJson), function (err) {
				  	if (err) throw err;
				  	logger.info('It\'s saved!');
				});
				res.send('(\'{"message": "successful"}\')');
			}
		});

	}else{
		var configData;
		var json;
		fs.readFile(vhosts.config,'utf-8', function (err, data) {
			if(err){
				logger.error(err);
			}else{
				if(data){
					logger.info(data);
					var json = JSON.parse(data);
				}else{
					json = {};
				}
			}
			/*服务器配置*/
			// 每添加一条规则，更新配置文件
			if(req.body.type === "sh"){
				json.vhost = JSON.parse(req.body.sh);
				modifyConfig();
			}
			//每删除一条规则更新配置文件
			if(req.body.type === "dh"){
				delete json.vhost[req.body.dh]
				modifyConfig();
			}

			//禁用某条规则
			if(req.body.type === "disable"){
				delete json.vhost[req.body.disrule]
				modifyConfig();
			}	

			if(req.body.type === "openProxy"){
				json.proxy = req.body.rule;
				modifyConfig();
			}

			if(req.body.type === "cancelProxy"){
				if(req.body.rule === "1"){
					json.proxy = [];
				}else{
					json.proxy = req.body.rule;
				}
				
				modifyConfig();
			}	

			function modifyConfig(){
				fs.writeFile(vhosts.config, JSON.stringify(json), function (err) {
				  	if (err) throw err;
				  	logger.info('It\'s saved!');
				});
				res.send('(\'{"message": "successful"}\')');
			}
		});
	}				
};
