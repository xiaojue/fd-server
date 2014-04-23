/*
 *  export config file
 */

var hostFile = require("hosts-group");
var fs = require("fs");
var path = require('path');

var vhosts = {
	config: path.resolve(__dirname, '../../../', 'config.json')
};

function getScope(){
	var host = hostFile.get();
	var confStr = fs.readFileSync(vhosts.config, 'utf-8');
	var json = JSON.parse(confStr);
	json['hosts'] = host;
	return json;
}

exports.show = function(req, res) {
	var data = getScope();
	res.header("content-type","application/force-download");
	res.end(JSON.stringify(data));
};