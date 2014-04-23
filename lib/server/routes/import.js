/*
 * import config file
 */

var logger = require('../../log/logger.js').getLogger("uipage");
var fs = require("fs");
var path = require('path');

var vhosts = {
	config: path.resolve(__dirname, '../../../', 'config.json')
};


exports.show = function(req, res) {
	var importdata = req.body; 
	logger.info(JSON.stringify(importdata));
	fs.writeFileSync(vhosts.config, JSON.stringify(importdata,null,4),'utf-8');
	res.json(importdata);
};