/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 对应bin文件的command指令实现
 */
var Service = require('./systemService.js');
var log = require('./log/logger.js');
var logger = log.getLogger('operate');
var http = require("http");
var Path = require("path");
var fs = require("fs");

var fdserverService = {
	name: 'fd-server',
	description: 'the Front-end development server',
	script: Path.join(__dirname, 'sysMaster.js')
};

var masterHost = 'http://127.0.0.1';
var masterPort = 8123;

function getServerCommand(type, success, error) {
	http.get(masterHost + ':' + masterPort + '/?type=' + type, success).on('error', error);
}

function exitProcess() {
	process.exit();
}

var fdserver = {
	commanders: {
		install: {
			description: 'install the fd-server service',
			exec: function() {
				Service.getService(fdserverService, exitProcess);
			}
		},
		start: {
			description: 'start the fd-server service',
			exec: function() {
				Service.getService(fdserverService, function(svc) {
					svc.on('start', function() {
						getServerCommand('start', exitProcess, logger.error);
					});
					svc.start();
				});
			}
		},
		stop: {
			description: 'stop the fd-server service',
			exec: function() {
				getServerCommand('stop', exitProcess, logger.error);
			}
		},
		restart: {
			description: 'restart the fd-server service',
			exec: function() {
				getServerCommand('restart', exitProcess, logger.error);
			}
		},
		uninstall: {
			description: 'uninstall the fd-server service',
			exec: function() {
				Service.remove(fdserverService, exitProcess);
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
				logger.info("日志路径已变更，需要大概一分钟后生效，若无变更，请尝试重启服务。");
			}
		}
	},
	optionsChecks: function(program) {
		for (var key in this.options) {
			var option = this.options[key];
			var cmd = program[option['shortName']];
			if (cmd) {
				option['exec'](cmd.args);
				return true;
			}
		}
		return false;
	}
};

module.exports = fdserver;

