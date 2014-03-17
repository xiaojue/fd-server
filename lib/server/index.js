/**
*@description 服务主线程入口
*@updateTime 2014-02-20/28 添加日志管理
*/

var fs = require("fs");
var async = require("async");
var bouncy = require('bouncy');
var hosts = require("./hosts");
var Path = require("path");
var nproxy = require("nproxy");
var expr = require("./app.js");
var log = require('../log/logger');
var logger = log.getLogger("operate");
var config = require('../sysconfig');
var utils = require('../utils');
var nodeStatic = require('node-static').Server;
var http = require('http');
var url = require('url');
var vm = require('vm');
var qs = require('querystring');
var route = require("./route");
var requestUrl = require('request');
var listFilePath = Path.join(__dirname, "proxy_list.js");
var r = requestUrl.defaults({
	'proxy': 'http://' + config.nproxy.host + ':' + config.nproxy.port
});

function fdMaster() {
	this.configPath = Path.join(__dirname, "../../config.json");
	this.vhost = [];
	this.proxy = [];
	this.routeList = {}; //域名:端口
	this.statics = []; //所有static server
	this.proxyServer = null;
	this.bouncyServer = null;
	this.init();
}

fdMaster.prototype = {
	constructor: fdMaster,
	init: function() {
		this.setup();
	},
	setup: function() {
		var self = this;
		utils.watchFile(self.configPath, function(err, json) {
			if (err) logger.error(err);
			else {
				logger.debug("配置文件变化,开始更新服务");
				self.restart(utils.noop);
			}
		},3);
	},
	_batchData: function(data) {
		//初始化vhost配置数据
		this.vhosts = [];
		this.proxy = [];
		this.routeList = {};
		//私有路由-uipage port转发
		this.vhosts.push({
			port: config.uipage.port,
			domain: config.uipage.host
		});
		for (var i in data.vhost) {
			this.vhosts.push({
				path: data.vhost[i],
				domain: i
			});
		}
		this.proxy = data.proxy;
	},
	reload: function(cb) {
		var self = this,
		json = utils.fileToJson(this.configPath);
		this._batchData(json);
		async.series([
		function(callback) {
			self.setupProxy(callback);
		},
		function(callback) {
			self.setupVhost(callback);
		}], cb);

	},
	start: function(cb) {
		var self = this,
		json = utils.fileToJson(this.configPath);
		this._batchData(json);
		async.series([
		function(callback) {
			expr.listen(config.uipage.port, callback);
		},
		function(callback) {
			self.setupProxy(callback);
		},
		function(callback) {
			self.setupVhost(callback);
		},
		function(callback) {
			self.setupBouncy(callback);
		}], function() {
			logger.info('expr proxy vhost bouncy 已启动');
			if (cb) cb();
		});
	},
	stop: function(cb) {
		var self = this;
		async.series([
		function(callback) {
			self.stopProxy(callback);
		},
		function(callback) {
			self.stopVhost(callback);
		}], function() {
			logger.info('expr proxy vhost bouncy 已关闭');
			if (cb) cb();
		});
	},
	restart: function(cb) {
		var self = this;
		async.series([function(cb) {
			logger.info('restart stop');
			self.stop(cb);
		},
		function(cb) {
			logger.info('restart reload');
			self.reload(cb);
		}], function() {
			logger.info('proxy vhost已重启');
			if (cb) cb();
		});
	},
	isNode: function(req) {
		return Path.extname(url.parse(req.url).pathname) == '.node';
	},
	runNode: function(file, req, res) {
		var code = fs.readFileSync(file, 'utf-8');
		try {
			vm.runInNewContext(code, {
				logger: logger,
				'__dirname': Path.dirname(file),
				require: require,
				route: function(run) {
					run(req, res);
				}
			});
		} catch(e) {
			logger.error(e);
		}
	},
	bindStatic: function(fileServer, req, res) {
		req.addListener('end', function() {
			fileServer.serve(req, res, function(err, result) {
				if (err) {
					res.writeHead(err.status, err.headers);
					res.end();
				}
			});
		}).resume();
	},
	matchProxy: function(req) {
		if (fs.existsSync(listFilePath)) {
			var proxylist;
			delete require.cache[require.resolve(listFilePath)];
			proxylist = require(listFilePath);
			for (var i = 0; i < proxylist.length; i++) {
				var proxy = proxylist[i];
				if (proxy.pattern == 'http://' + req.headers.host + req.url || new RegExp(proxy.pattern).test('http://' + req.headers.host + req.url)) {
					return true;
				}
			}
		}
		return false;
	},
	catchProxy: function(req, res) {
		if (req.method == 'GET') {
			r.get('http://' + req.headers.host + req.url).pipe(res);
		} else if (req.method == 'POST') {
			var body = '';
			req.on('data', function(data) {
				body += data;
			});
			req.on('end', function() {
				r.post({
					url: 'http://' + req.headers.host + req.url,
					body: body,
					headers: req.headers
				}).pipe(res);
			});
		}
	},
	setupVhost: function(cb) {
		var self = this;
		var len = self.vhosts.length;

		if (!len) cb();
		async.each(this.vhosts, function(item, callback) {
			var path = item.path,
			port = item.port,
			domain = item.domain;

			if (path && fs.existsSync(path)) {
				//配置静态服务
				var fileServer = new nodeStatic(path);
				var httpServer = http.createServer(function(req, res) {
					var file = Path.join(path, url.parse(req.url).pathname);
					if (self.matchProxy(req)) {
						self.catchProxy(req, res);
						return;
					}
					if (self.isNode(req) && fs.existsSync(file)) {
						self.runNode(file, req, res);
						return;
					}
					self.bindStatic(fileServer, req, res);
				});
				httpServer.on('error', function(err) {
					logger.error(err);
				});
				utils.getPort(function(port) {
					self.routeList[domain] = port;
					self.statics.push(httpServer);
					httpServer.listen(port, callback);
				});
			} else if (port) {
				//配置端口转发	
				self.routeList[domain] = port;
				callback();
			}
		},
		cb);
	},
	setupProxy: function(cb) {
		var self = this,
		listContent = "module.exports = " + JSON.stringify(this.proxy) + ";";
		fs.writeFileSync(listFilePath, listContent);
		this.proxyServer = nproxy(config.nproxy.port, {
			"responderListFilePath": listFilePath,
			"debug": false
		});
		async.parallel({
			https: function(callback) {
				self.proxyServer['httpsServer'].on('listening', callback);
			},
			http: function(callback) {
				self.proxyServer['httpServer'].on('listening', callback);
			}
		},
		cb);
	},
	setupBouncy: function(cb) {
		var self = this;
		this.bouncyServer = bouncy(function(req, res, bounce) {
			console.log('route');
			var port = self.routeList[req.headers.host];
			if (port) {
				bounce(port);
			} else {
				res.statusCode = 404;
				res.end("no such host");
			}
		});
		this.bouncyServer.on("error", function(err) {
			logger.error(err);
		});
		this.bouncyServer.on("listening", cb);
		this.bouncyServer.listen(config.bouncy.port);
	},
	stopBouncy:function(cb){
		this.bouncyServer.close(cb);		   
	},
	stopVhost: function(cb) {
		var self = this,
		len = this.statics.length;
		if (!len) cb();
		async.each(this.statics, function(server, callback) {
			server.close();
			callback();
		},
		function() {
			self.statics = [];
			cb();
		});
	},
	stopProxy: function(cb) {
		var self = this;
		if (this.proxyServer) {
			async.parallel({
				http: function(callback) {
					self.proxyServer['httpServer'].close();
					callback();
				},
				https: function(callback) {
					self.proxyServer['httpsServer'].close();
					callback();
				}
			},
			function() {
				self.proxyServer = null;
				//fs.unlinkSync(listFilePath);
				if (cb) cb();
			});
		}
	}
};

module.exports = new fdMaster();

