
/*
 * config listing.
 */

exports.list = function(req, res){
	var util = require('util');
	var fs = require("fs");
	if(req.body.local === "s"){
		var localJson;
		fs.readFile('localConfig.json','utf-8', function (err, data) {
			if(err){
				console.log(err);
			}else{
				if(data){
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
				fs.writeFile('localConfig.json', JSON.stringify(localJson), function (err) {
				  	if (err) throw err;
				  	console.log('It\'s saved!');
				});
				res.send('(\'{"message": "successful"}\')');
			}
		});

	}else{
		var configData;
		var json;
		fs.readFile('config.json','utf-8', function (err, data) {
			if(err){
				console.log(err);
			}else{
				if(data){
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
				json.proxy = JSON.parse(req.body.rule);
				modifyConfig();
			}

			if(req.body.type === "cancelProxy"){
				json.proxy = JSON.parse(req.body.rule);
				modifyConfig();
			}	

			function modifyConfig(){
				fs.writeFile('config.json', JSON.stringify(json), function (err) {
				  	if (err) throw err;
				  	console.log('It\'s saved!');
				});
				res.send('(\'{"message": "successful"}\')');
			}
		});
	}

	
				
};
