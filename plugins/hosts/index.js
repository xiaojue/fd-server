/**
 * @author RK_CODER[javawjw@163.com]
 * @date 20150113
 * @fileoverview hosts plugin for fds
 */
var hosts = require("hosts-group");
var logger = require('../../lib/log/logger');

function updateHosts(hostsData, cb){
    var _hostsData = hosts.get();
    var i, k, group, host;
    for(k in hostsData){
        group = hostsData[k];
        if(!_hostsData[k]){
            hosts.addGroup(k);
        }

        for(i = 0; i < group.length; i++){
            host = group[i];
            host.groupName = k;
            host.domain ? hosts.set(host.domain, host.ip, host) : '';
        }
    }
    cb();
}

module.exports = function (fds){
    return {
        start: function (cb){
            logger.info("hosts start ...");
            var configManager = fds.configManager;
            var config = configManager.getJson();

            if(!config.hosts){
                config.hosts = [];
                configManager.set(config);
            }

            updateHosts(config.hosts, cb);
        },
        stop: function (cb){
            //无操作
            logger.info("hosts stop ...");
            cb();
        }
    };
};