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
var filesize = require('file-size');

var logFile = Path.resolve(__dirname, '../fdserver.log');
var backupDir = Path.resolve(__dirname, '../backup');

if (!fs.existsSync(logFile)) {
	fs.writeFileSync(logFile, '');
}


fs.stat(logFile, function (err, stats) {
    var sizes = filesize(stats.size).to('MB', true);
    logger.info(sizes);
    if(sizes > 0.1){	
		var data = fs.readFileSync(logFile, 'utf-8');
		//备份文件
		if(!fs.existsSync(backupDir)){
			fs.mkdirSync(backupDir);
		}
		var backFiles = Path.resolve(__dirname, '../backup', 'backFiles' + new Date().getTime() + '.txt');
		fs.writeFileSync(backFiles, data);
		var dataArr = data.split(/\n/g);
		var r = dataArr.slice( - 200).join("\n");
		fs.writeFileSync(logFile, r);
    }
});

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
					var pidfile = forever.root + '/pids/' + foreverOptions.uid + '.pid';
					if (!fs.existsSync(pidfile)) {
						forever.startDaemon(masterScript, foreverOptions).on('error', function(err) {
							forever.log.error(err.message);
						});
						logger.info('fds start successed');
					} else {
						logger.info('fds allready start');
					}
				}
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				if (isWin) {
					logger.info('windows system not supported stop');
				} else {
					forever.stop('fdserver').on('stop', function() {
						logger.info('fds stop successed');
					}).on('error', function(err) {
						forever.log.error(err.message);
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

