/*
 * GET home page.
 */
var logger = require('../../log/logger.js');
var fs = require("fs");
var path = require("path");
var hosts = require('hosts-group');
var utils = require('../../utils');
var vhosts = {
	config: path.resolve(__dirname, '../../../', 'config.json')
};

function getScope(){
	var host = hosts.get();
	var confStr = fs.readFileSync(vhosts.config, 'utf-8');
	var json = JSON.parse(confStr);
	json['hosts'] = host;
	return json;
}

exports.index = function(req, res) {
	var data = JSON.stringify(getScope());
	res.render('index', {
		title: 'fd-server admin'
	});
};

exports.scope = function(req, res) {
	var data = getScope();
	res.json(data);
};

exports.save = function(req,res){
	var data = req.body;
	var olddata = getScope();	
	var newdata = utils._.extend(olddata,data);
	fs.writeFileSync(vhosts.config,JSON.stringify(newdata,null,4),'utf-8');
	res.json(newdata);
};

exports.removeHost = function(req,res){
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();	
	delete olddata['vhost'][domain];
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.toggleHost = function(req,res){
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();	
	olddata['vhost'][domain]['status'] = !olddata['vhost'][domain]['status'];
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.removeGroup = function(req,res){
	var groupname = req.body.groupname;
	var olddata = getScope();	
	olddata['proxyGroup'] = utils._.without(olddata['proxyGroup'],groupname);
	olddata['proxy'] = utils._.filter(olddata['proxy'],function(proxy){ 
		return proxy.group != groupname;
	});
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};

exports.editProxy = function(req,res){
	var pattern = req.body.pattern,
		oldpattern = req.body.oldpattern,
		oldresponder = req.body.oldresponder,
		responder = req.body.responder;
	var olddata = getScope();
	var index = utils._.findIndex(olddata['proxy'],function(item){
		return item.pattern == oldpattern && item.responder == oldresponder;
	});
	logger.info(index);
	olddata['proxy'][index]['pattern'] = pattern;
	olddata['proxy'][index]['responder'] = responder;
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};

exports.editProxyGroup = function(req,res){
	var oldname = req.body.oldname,
		newname = req.body.newname;
	var olddata = getScope();
	olddata['proxyGroup'] = utils._.without(olddata['proxyGroup'],oldname);
	olddata['proxyGroup'].push(newname);
	olddata['proxy'].forEach(function(item,index){
		if(item.group == oldname) {
			olddata['proxy'][index]['group'] = newname;	
		}	
	});
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};

exports.removeProxy = function(req,res){
	var host = hosts.get();
	var pattern = req.body.pattern;
	var responder = req.body.responder;
	var olddata = getScope();	
	var index = utils._.findIndex(olddata['proxy'],function(item){
		return item.pattern == pattern && item.responder == responder;
	});
	olddata['proxy'].splice(index,1);
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};

exports.disabledProxy = function(req,res){
	var pattern = req.body.pattern;
	var responder = req.body.responder;
	var olddata = getScope();	
	var index = utils._.findIndex(olddata['proxy'],function(item){
		return item.pattern == pattern && item.responder == responder;
	});
	olddata['proxy'][index].disabled = req.body.disabled === 'true' ? true : false;
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};

exports.onlineProxy = function(req,res){
	var openOnlineProxy = req.body.openOnlineProxy;
	var domain = req.body.domain;
	var olddata = getScope();	
	olddata['vhost'][domain].openOnlineProxy = parseInt(openOnlineProxy,10);
	fs.writeFileSync(vhosts.config,JSON.stringify(olddata,null,4),'utf-8');
	res.json(olddata);
};
