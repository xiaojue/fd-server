/*
 * GET home page.
 */
var logger = require('../../log/logger.js');
var fs = require("fs");
var async = require('async');
var path = require("path");
var hosts = require('hosts-group');
var utils = require('../../utils');
var os = require('os');
var task = require('../task/index.js');
var configManager = require('../../configManager');
var watch = require('../watch');

function getScope() {
	var host = hosts.get();
	var json = configManager.getJson();
	json['hosts'] = host;
	return json;
}

exports.index = function(req, res) {
	var ifaces = os.networkInterfaces();
	var ip = [];
	for (var dev in ifaces) {
		var alias = 0;
		ifaces[dev].forEach(function(details) {
			if (details.family == 'IPv4') {
				ip.push([dev + (alias ? ':' + alias: ''), details.address]); ++alias;
			}
		});
	}
	res.render('index', {
		title: 'fd-server admin',
		ip: ip
	});
};

exports.scope = function(req, res) {
	var data = getScope();
	res.json(data);
};

exports.save = function(req, res) {
	var data = req.body;
	var olddata = getScope();
	var newdata = utils._.extend(olddata, data);
	configManager.set(newdata);
	res.json(newdata);
};

exports.removeHost = function(req, res) {
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();
	delete olddata['vhost'][domain];
	configManager.set(olddata);
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.toggleHost = function(req, res) {
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();
	olddata['vhost'][domain]['status'] = ! olddata['vhost'][domain]['status'];
	configManager.set(olddata);
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.removeGroup = function(req, res) {
	var groupname = req.body.groupname;
	var olddata = getScope();
	olddata['proxyGroup'] = utils._.without(olddata['proxyGroup'], groupname);
	olddata['proxy'] = utils._.filter(olddata['proxy'], function(proxy) {
		return proxy.group != groupname;
	});
	configManager.set(olddata);
	res.json(olddata);
};

exports.editProxy = function(req, res) {
	var pattern = req.body.pattern,
	oldpattern = req.body.oldpattern,
	oldresponder = req.body.oldresponder,
	responder = req.body.responder;
	var olddata = getScope();
	var index = utils._.findIndex(olddata['proxy'], function(item) {
		return item.pattern == oldpattern && item.responder == oldresponder;
	});
	logger.info(index);
	olddata['proxy'][index]['pattern'] = pattern;
	olddata['proxy'][index]['responder'] = responder;
	configManager.set(olddata);
	res.json(olddata);
};

exports.editProxyGroup = function(req, res) {
	var oldname = req.body.oldname,
	newname = req.body.newname;
	var olddata = getScope();
	olddata['proxyGroup'] = utils._.without(olddata['proxyGroup'], oldname);
	olddata['proxyGroup'].push(newname);
	olddata['proxy'].forEach(function(item, index) {
		if (item.group == oldname) {
			olddata['proxy'][index]['group'] = newname;
		}
	});
	configManager.set(olddata);
	res.json(olddata);
};

exports.removeProxy = function(req, res) {
	var host = hosts.get();
	var pattern = req.body.pattern;
	var responder = req.body.responder;
	var olddata = getScope();
	var index = utils._.findIndex(olddata['proxy'], function(item) {
		return item.pattern == pattern && item.responder == responder;
	});
	olddata['proxy'].splice(index, 1);
	configManager.set(olddata);
	res.json(olddata);
};

exports.disabledProxy = function(req, res) {
	var pattern = req.body.pattern;
	var responder = req.body.responder;
	var olddata = getScope();
	var index = utils._.findIndex(olddata['proxy'], function(item) {
		return item.pattern == pattern && item.responder == responder;
	});
	olddata['proxy'][index].disabled = req.body.disabled === 'true' ? true: false;
	configManager.set(olddata);
	res.json(olddata);
};

exports.onlineProxy = function(req, res) {
	var openOnlineProxy = req.body.openOnlineProxy;
	var domain = req.body.domain;
	var olddata = getScope();
	olddata['vhost'][domain].openOnlineProxy = parseInt(openOnlineProxy, 10);
	configManager.set(olddata);
	res.json(olddata);
};

exports.setTaskpath = function(req, res) {
	var taskPath = req.body.path;
	var json = configManager.getJson();
	if (taskPath == json.taskDir || task.setDir(taskPath)) {
		var result = task.readTask(taskPath);
		res.json({
			data: result
		});
	} else {
		res.json({
			error: "路径设置失败，请查看路径是否存在。"
		});
	}
};

function getFiles(dir,files_){
    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_=[];
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = path.join(dir,files[i]);
		var filter = /node_modules|.svn|.git/g.test(name);
        if (fs.statSync(name).isDirectory() && !filter){
            getFiles(name,files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

exports.watch = function(req,res){
	var status = watch.getStatus();
	res.jsonp({changed:status});
};

exports.setWatchpath = function(req,res) {
	var watchPath = req.body.path;
	var json = configManager.getJson();
	var message;
	if (watchPath && fs.existsSync(watchPath)) {
		var files = getFiles(watchPath).filter(function(item){
			var extname = path.extname(item);
			return extname == '.html' || extname == '.js' || extname == '.css' || extname == '.scss';
		});
		var total = files.length;
		if(total > 1000){
			message = '监控文件超过1000个 目录含有:'+total+'个文件';
		}else{
			json.watchPath = watchPath;
			configManager.set(json);
			watch.setfiles(files);
			message = '监控成功 目录含有： '+total+'个文件';
		}
		res.json({
			message:message
		});
	} else {
		res.json({
			message: '请检查路径设置，路径是否存在 ' + watchPath
		});
	}
};

exports.runTask = function(req, res) {
	var list = req.body.list;
	if (list && list.length > 0) {
		var key = "k" + new Date().valueOf();
		res.json({
			key: key
		});
		task.runTasks(list, key);
	}
};

