/*
 * GET home page.
 */
var logger = require('../../log/logger.js').getLogger("uipage");
var fs = require("fs");
var path = require("path");
var hosts = require('hosts-group');
var vhosts = {
	localConfig: path.resolve(__dirname, '../../../', 'localConfig.json'),
	config: path.resolve(__dirname, '../../../', 'config.json')
};

exports.index = function(req, res) {

	var host = hosts.get();

	var localStr = fs.readFileSync(vhosts.localConfig, 'utf-8');
	var localJson = JSON.parse(localStr);
	var confStr = fs.readFileSync(vhosts.config, 'utf-8');
	var json = JSON.parse(confStr);

	res.render('index', {
		tpl: host,
		title: 'fd-server admin',
		data: localJson,
		datac: json
	});

};

