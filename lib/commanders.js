/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 对应bin文件的command指令实现
 */
var forever = require('forever');
var os = require('os');
var sys = os.platform();
var logger = require('./log/logger');
var http = require("http");
var Path = require("path");
var config = require('./sysconfig');
var fs = require('fs');
var isWin = (/^win/).test(os.platform()) ? true: false;
var logFile = Path.resolve(__dirname, '../fdserver.log');

if (!fs.existsSync(logFile)) {
	fs.writeFileSync(logFile, '');
}

var foreverOptions = {
	uid: 'fdserver',
	command: 'node',
	logFile: logFile
};

var masterScript = Path.join(__dirname, 'master.js');

var fdserver = {
	commanders: {
		start: {
			description: 'start the fd-server service',
			exec: function() {
				if (isWin) {
					forever.start(masterScript, foreverOptions).on('start', function() {
						logger.info('fds start successed');
					});
				} else {
					function _start(){
						var child = forever.startDaemon(masterScript, foreverOptions);
						logger.info('All the log put in the '+foreverOptions.logFile+' file');
					}
					forever.stop(foreverOptions.uid).on('stop',_start).on('error',_start);
				}
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				if (isWin) {
					logger.info('windows system not supported stop');
				} else {
					forever.stop(foreverOptions.uid).on('stop', function() {
						logger.info('fds stop successed');
					}).on('error', function(err) {
						logger.error(err.message);
					});
				}
			}
		},
		restart: {
			description: 'restart the fd-server service',
			exec: function() {
				if (isWin) {
					logger.info('windows system not supported restart');
				} else {
					forever.restart('fdserver').on('restart', function() {
						logger.info('fds restart successed');
					}).on('error', function(err) {
						forever.log.error(err.message);
					});
				}
			}
		}
	},
	optionsChecks: function(program) {
		for (var key in this.options) {
			var option = this.options[key];
			var cmd = program[option['shortName']];
			if (cmd) {
				option['exec'](cmd);
				return true;
			}
		}
		return false;
	}
};

module.exports = fdserver;

