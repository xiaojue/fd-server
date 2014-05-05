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

var logFile = Path.resolve(__dirname, '../fdserver.log');

if (!fs.existsSync(logFile)) {
	fs.writeFileSync(logFile, '');
}

var foreverOptions = {
	uid: 'fdserver',
	logFile: logFile
};

var masterScript = Path.join(__dirname, 'master.js');

var fdserver = {
	commanders: {
		start: {
			description: 'start the fd-server service',
			exec: function() {
				var pidfile = forever.root + '/pids/' + foreverOptions.uid + '.pid';
				if (!fs.existsSync(pidfile)) {
					forever.startDaemon(masterScript, foreverOptions).on('error', function(err) {
						forever.log.error(err.message);
					});
				}
				logger.info('fds start successed');
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				forever.stop('fdserver').on('stop', function() {
					logger.info('fds stop successed');
				}).on('error', function(err) {
					forever.log.error(err.message);
				});
			}
		},
		restart: {
			description: 'restart the fd-server service',
			exec: function() {
				forever.restart('fdserver').on('restart', function() {
					logger.info('fds restart successed');
				}).on('error', function(err) {
					forever.log.error(err.message);
				});
			}
		}
	},
	options: {
		setLogPath: {
			description: 'set log filepath',
			command: '-l, --log [path]',
			shortName: 'log',
			exec: function(logPath) {
				log.setLogPath(logPath);
				successHandle("日志路径已变更，需要大概一分钟后生效，若无变更，请尝试重启服务。");
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

