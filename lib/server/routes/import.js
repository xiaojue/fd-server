/*
 *  import config file
 */
var fs = require("fs");
var path = require('path');
var utils = require('../../utils');
var configManager = require('../../configManager');

exports.show = function(req, res) {
	var data = req.body;
	var olddata = {
		"vhost": {},
		"proxy": [],
		"proxyGroup": [],
		"port": 8989
	};
	var newdata = utils._.merge(olddata,data);
    configManager.set(newdata);
	res.json(data);
};