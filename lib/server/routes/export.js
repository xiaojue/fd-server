/*
 *  export config file
 */

var hostFile = require("hosts-group");
var fs = require("fs");
var path = require('path');
var configManager = require('../../configManager');

function getScope(){
	var host = hostFile.get();
	var json = configManager.getJson();
	json['hosts'] = host;
	return json;
}

exports.show = function(req, res) {
	var data = getScope();
	res.header("content-type","application/force-download");
	res.end(JSON.stringify(data));
};