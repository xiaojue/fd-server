/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 日志管理
 */
var log4js = require("log4js");
var path = require("path");
var fs = require("fs");
var confPath = path.join(__dirname, "./conf.json");
var utils = require('../utils');

function fdLog() {
	this.confPath = this._getFileAbsPath('./conf.json');
	this.runConfPath = this._getFileAbsPath('./_conf.json');
	this.rootPath = path.resolve(__dirname, '../../');
	this.init();
}

fdLog.prototype = {
	constructor: fdLog,
	_getFileAbsPath: function(p) {
		return path.join(__dirname, p);
	},
	_getJson: function(p) {
		var data = fs.readFileSync(p);
		return JSON.parse(data);
	},
	_isResPath: function(p) {
		return (/^\./).test(p);
	},
	_initLogPath: function() {
		var self = this;
		//复写配置文件dirname
		var configSource = this._getJson(this.confPath);
		if (!configSource.dirname || !fs.existsSync(configSource.dirname)){
			configSource = this._setDirPath(this.rootPath);
		}
		//改写运行时path
		var appenders = configSource.appenders;
		appenders.forEach(function(appender, index) {
			var filename = appender.filename;
			if (filename && self._isResPath(filename)) {
				var filepath = path.join(configSource.dirname, filename);
				appenders[index].filename = filepath;
				utils.mkdirsSync(path.dirname(filepath));
			}
		});
		fs.writeFileSync(this.runConfPath, JSON.stringify(configSource));
	},
	_setDirPath: function(dirpath) {
		var configSource = this._getJson(this.confPath);
		configSource.dirname = path.resolve(process.cwd(),dirpath);
		fs.writeFileSync(this.confPath, JSON.stringify(configSource));
		return configSource;
	},
	init: function() {
		this._initLogPath();
		log4js.configure(this.runConfPath, {
			reloadSecs: 180
		});
	},
	setLogPath: function(logPath) {
		this._setDirPath(logPath);
		this._initLogPath();
	},
	getLogger: function(category, level) {
		var logger = log4js.getLogger(category || 'all');
		logger.setLevel(level || 'DEBUG');
		return logger;
	}
};

module.exports = new fdLog();

