/*
 * hostGroup listing.
 */

var logger = require('../../log/logger.js');
var path = require('path');
var fs = require("fs");
var hostFile = require("hosts-group");
var configManager = require('../../configManager');

function getScope(){
	var host = hostFile.get();
	var json = configManager.getJson();
	json['hosts'] = host;
	return json;
}

function switchHost(type, data) {
	var groupname = data.groupname,
	domain = data.domain,
	ip = data.ip,
	oldname = data.oldname,
	newname = data.newname,
	olddomain = data.olddomain,
	oldip = data.oldip,
	disabled = data.disabled,
	typemap = {
		'en': function() {
			hostFile.setGroup(oldname, newname);
		},
		'editrule': function() {
			hostFile.set(domain, ip, {
                groupName: groupname,
                olddomain: olddomain,
                oldip: oldip,
                disabled: disabled
            });
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
