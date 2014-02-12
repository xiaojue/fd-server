
/*
 * GET config listing.
 */

exports.list = function(req, res){
	var util = require('util');
	var fs = require("fs");
	var configData;
	/*代理服务器配置*/

	/*服务器配置*/
	// 每添加一条规则，更新配置文件
	if(req.body.type === "sh"){
		fs.writeFile('config.json', req.body.sh, function (err) {
		  	if (err) throw err;
		  	console.log('It\'s saved!');
		});
		res.send('(\'{"message": "add successful"}\')');	
	}
	//每删除一条规则更新配置文件
	if(req.body.type === "dh"){
		fs.writeFile('config.json', req.body.dh, function (err) {
		  	if (err) throw err;
		  	console.log('It\'s saved!');
		});
		res.send('(\'{"message": "successful"}\')');
	}

	if(req.body.type === "openProxy"){
		fs.writeFile('proxy.json', req.body.rule, function (err) {
		  	if (err) throw err;
		  	console.log('It\'s saved!');
		});
		res.send('(\'{"message": "successful"}\')');
	}

	if(req.body.type === "cancelProxy"){
		fs.writeFile('proxy.json', req.body.rule, function (err) {
		  	if (err) throw err;
		  	console.log('It\'s saved!');
		});
		res.send('(\'{"message": "successful"}\')');
	}				
};
