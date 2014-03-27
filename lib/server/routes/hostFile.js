
/*
 * hostGroup listing.
 */

var logger = require('../../log/logger.js').getLogger("uipage");
var path = require('path');
var fs = require("fs");
var hostFile = require("hosts-group");

exports.host = function(req, res){
	logger.info("hostGroup请求: " + req.url);
	switch(req.body.type){
		//编辑组的名字
		case "en": 
			var data = req.body.data;
			hostFile.setGroup(data.oldname,data.newname);
			res.send('(\'{"message": "successful"}\')');
		break;
		//编辑host
		case "editrule": 
			var data = req.body.data;
			logger.info("data数据请求: " + data.domain + data.ip + data.groupname);
			hostFile.set(data.domain, data.ip, data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "deleterule":
		    var data = req.body.data;
			logger.info("data数据请求: " + data.domain + data.ip + data.groupname);
			hostFile.remove(data.domain, data.ip, data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "disablerule":
			var data = req.body.data;
			logger.info("data数据请求: " + data.domain + data.ip + data.groupname);
			hostFile.disable(data.domain, data.ip, data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "activerule":
			var data = req.body.data;
			logger.info("data数据请求: " + data.domain + data.ip + data.groupname);
			hostFile.active(data.domain, data.ip, data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "disableGroup":
			var data = req.body.data;
			logger.info("data数据请求: " + data.groupname);
			hostFile.disableGroup(data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "activeGroup":
			var data = req.body.data;
			logger.info("data数据请求: " + data.groupname);
			hostFile.activeGroup(data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "addGroup":
			var data = req.body.data;
			logger.info("data数据请求: " + data.groupname);
			hostFile.addGroup(data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;
		case "removeGroup":
			var data = req.body.data;
			logger.info("data数据请求: " + data.groupname);
			hostFile.removeGroup(data.groupname);
			res.send('(\'{"message": "successful"}\')');
		break;	
	}
};
