/*
 * hostGroup listing.
 */

var log = require('../../log/logger.js');
var logger = log.getLogger("uipage");
var path = require('path');
var fs = require("fs");
var hostFile = require("hosts-group");
var vhosts = {
	//localConfig: path.resolve(__dirname, '../../../', 'localConfig.json'),
	config: path.resolve(__dirname, '../../../', 'config.json')
};

function getScope(){

	var host = hostFile.get();
	var confStr = fs.readFileSync(vhosts.config, 'utf-8');
	var json = JSON.parse(confStr);
	json['hosts'] = host;
	return json;
}

function switchHost(type, data) {
	var groupname = data.groupname,
	domain = data.domain,
	ip = data.ip,
	oldname = data.oldname,
	newname = data.newname,
	typemap = {
		'en': function() {
			hostFile.setGroup(oldname, newname);
		},
		'editrule': function() {
			hostFile.set(domain, ip, groupname);
		},
		'deleterule': function() {
			hostFile.remove(domain, ip, groupname);
		},
		'disablerule': function() {
			hostFile.disable(domain, ip, groupname);
		},
		'activerule': function() {
			hostFile.active(domain,ip,groupname);
		},
		'disableGroup': function() {
			hostFile.disableGroup(groupname);
		},
		'activeGroup': function() {
			hostFile.activeGroup(groupname);
		},
		'addGroup': function() {
			hostFile.addGroup(groupname);
		},
		'removeGroup': function() {
			hostFile.removeGroup(groupname);
		}
	};
	if (typemap[type]) typemap[type]();
}

exports.host = function(req, res) {
	switchHost(req.body.type, req.body.data);
	res.json(getScope());
};
