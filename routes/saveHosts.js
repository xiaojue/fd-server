
/*
 * config listing.
 */

exports.list = function(req, res){
	var util = require('util');
	var fs = require("fs");
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
			fs.writeFile('config.json', JSON.stringify(json), function (err) {
			  	if (err) throw err;
			  	console.log('It\'s saved!');
			});
			res.send('(\'{"message": "add successful"}\')');
		}
		//每删除一条规则更新配置文件
		if(req.body.type === "dh"){
			json.vhost = JSON.parse(req.body.dh);
			fs.writeFile('config.json', JSON.stringify(json), function (err) {
			  	if (err) throw err;
			  	console.log('It\'s saved!');
			});
			res.send('(\'{"message": "successful"}\')');
		}

		if(req.body.type === "openProxy"){
			json.proxy = JSON.parse(req.body.rule);
			fs.writeFile('config.json', JSON.stringify(json), function (err) {
			  	if (err) throw err;
			  	console.log('It\'s saved!');
			});
			res.send('(\'{"message": "successful"}\')');
		}

		if(req.body.type === "cancelProxy"){
			json.proxy = JSON.parse(req.body.rule);
			fs.writeFile('config.json', JSON.stringify(json), function (err) {
			  	if (err) throw err;
			  	console.log('It\'s saved!');
			});
			res.send('(\'{"message": "successful"}\')');
		}	

	});
				
};
