/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 对应bin文件的command指令实现
 */
var forever = require('forever');
var os = require('os');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var sys = os.platform();
var logger = require('./log/logger');
var http = require("http");
var Path = require("path");
var config = require('./sysconfig');
var fs = require('fs');
var isWin = (/^win/).test(sys) ? true: false;
var logFile = Path.resolve(__dirname, '../fdserver.log');
var fdurl = 'http://local.fd.server/';

if (!fs.existsSync(logFile)) {
	fs.writeFileSync(logFile, '');
}

var foreverOptions = {
	uid: 'fdserver',
	command: 'node',
	logFile: logFile
};

function openUrl(url) {
	setTimeout(function() {
		switch (sys) {
		case "darwin":
			exec('open ' + url);
			break;
		case "win32":
			exec('start ' + url);
			break;
		default:
			spawn('xdg-open', [url]);
			break;
		}
	},
	1000);
}

var masterScript = Path.join(__dirname, 'master.js');

var fdserver = {
	commanders: {
		start: {
			description: 'start the fd-server service',
			exec: function() {
				forever.start(masterScript, foreverOptions).on('start', function() {
					logger.warn('fds start successed , you can use startDeamon to start with daemon');
					openUrl(fdurl);
				});
			}
		},
		startDaemon: {
			description: 'start with daemon',
			exec: function() {
				if (isWin) {
					logger.error('windows system not supported start daemon');
				} else {
					function _start() {
						var child = forever.startDaemon(masterScript, foreverOptions);
						logger.info('log file ' + foreverOptions.logFile);
						logger.info('open http://local.fd.server/ to check the server!');
					}
					forever.stop(foreverOptions.uid).on('stop', _start).on('error', _start);
				}
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				if (isWin) {
					logger.error('windows system not supported stop');
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
						logger.error(err.message);
					});
				}
			}
		}
	}
};

module.exports = fdserver;

