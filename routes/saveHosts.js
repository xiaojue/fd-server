
/*
 * config listing.
 */

exports.list = function(req, res){
	var util = require('util');
	var fs = require("fs");

	var listener = require('../module/listener.js');
	var stream = new listener();
	stream.on("data", function(data) {
	    console.log('Received data: "' + data + '"');
	})
	

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
			json.vhost = JSON.parse(req.body.dh);
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
			  	stream.notice("It works!"); // Received data: "It works!"
			});
			res.send('(\'{"message": "successful"}\')');
		}
	});
				
};
