/*
 *  import config file
 */
var fs = require("fs");
var path = require('path');
var utils = require('../../utils');

var vhosts = {
	config: path.resolve(__dirname, '../../../', 'config.json')
};

exports.show = function(req, res) {
	var data = req.body;
	var olddata = {
		"vhost": {},
		"proxy": [],
		"proxyGroup": [],
		"port": 8989
	};
	var newdata = utils._.merge(olddata,data);
	fs.writeFileSync(vhosts.config,JSON.stringify(newdata,null,4),'utf-8');
	res.json(data);
};