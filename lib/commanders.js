/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 对应bin文件的command指令实现
 */
var Service = require('./systemService');
var os = require('os');
var sys = os.platform();
var log = require('./log/logger');
var logger = log.getLogger('operate');
var http = require("http");
var Path = require("path");
var config = require('./sysconfig');

var fdserverService = {
	name: 'fd-server',
	description: 'the Front-end development server',
	script: Path.join(__dirname, 'master.js')
};

function exitProcess() {
	process.exit();
}

function successHandle(msg) {
	if (msg) logger.info(msg);
	exitProcess();
}

function errorHandle(err) {
	if (err) logger.error(err);
	exitProcess();
}

var fdserver = {
	commanders: {
		install: {
			description: 'install the fd-server service',
			exec: function() {
				Service.getService(fdserverService, function(err, svc) {
					if (err) errorHandle(err);
					else {
						successHandle('注册服务成功');
					}
				});
			}
		},
		start: {
			description: 'start the fd-server service',
			exec: function() {
				Service.getService(fdserverService, function(err, svc) {
					if (err) errorHandle(err);
					else {
						svc.on('start', function() {
							successHandle('服务启动成功');
						});
						svc.start();
					}
				});
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				Service.getService(fdserverService, function(err, svc) {
					if (err) errorHandle(err);
					else {
						svc.on('stop', function() {
							successHandle('关闭服务成功');
						});
						svc.stop();
					}
				});
			}
		},
		restart: {
			description: 'restart the fd-server service',
			exec: function() {
				if (sys == 'win32') {
					successHandle('windows下请使用stop，start来restart,详细参见：https://github.com/coreybutler/node-windows/issues/41');
				} else {
					Service.getService(fdserverService, function(err, svc) {
						if (err) errorHandle(err);
						else {
							svc.restart(function() {
								successHandle('重启完成');
							});
						}
					});
				}
			}
		},
		uninstall: {
			description: 'uninstall the fd-server service',
			exec: function() {
				Service.remove(fdserverService, function(err) {
					if (err) errorHandle(err);
					else {
						successHandle('删除服务成功');
					}
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

