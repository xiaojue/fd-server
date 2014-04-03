/*
 * hostGroup listing.
 */

var log = require('../../log/logger.js');
var logger = log.getLogger("uipage");
var path = require('path');
var fs = require("fs");
var hostFile = require("hosts-group");

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
			hostFile.activeGroup(groupname);
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
	logger.info("hostGroup请求: " + req.url);
	switchHost(req.body.type, req.body.data);
	res.send('(\'{"message": "successful"}\')');
};
