/**
*@description 服务主线程入口
*@updateTime 2014-02-20/28 添加日志管理
*/
var fs = require("fs");
var Path = require("path");
var expr = require("./app.js");
var log = require('../log/logger');
var logger = log.getLogger("operate");
var config = require('../sysconfig');
var utils = require('../utils');
var nodeStatic = require('node-static');
var http = require('http');
var url = require('url');
var vm = require('vm');
var qs = require('querystring');
var route = require("./route");
var requestUrl = require('request');
var listFilePath = Path.join(__dirname, "proxy_list.js");
var r = requestUrl.defaults({
	'proxy': 'http://' + config.proxy.host + ':' + config.proxy.port
});

function fdMaster() {
	this.configPath = Path.join(__dirname, "../../config.json");
	this.vhost = [];
	this.proxy = [];
	this.routeList = {}; //域名:端口
	this.statics = []; //所有static server
	this.init();
}

fdMaster.prototype = {
	constructor: fdMaster,
	init: function() {
		this.setup();
	},
	setup: function() {
		var self = this;
		expr.listen(config.uipage.port, config.uipage.host);
		fs.exists(this.configPath, function(t) {
			if (t) {
				//添加监听文件更新事件
				fs.watchFile(self.configPath, {
					interval: 10000
				},
				function(curr, prev) {
					if (curr.mtime > prev.mtime) {
						logger.debug("配置文件变化,开始更新服务");
						self.restart();
					}
				});
				self.start();
			} else {
				logger.warn("没有找到配置文件" + path);
			}
		});
	},
	_batchData: function(data) {
		//初始化vhost配置数据
		this.vhosts = [];
		this.proxy = [];
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
	start: function(cb) {
		var self = this,
			json = utils.fileToJson(this.configPath);
		this._batchData(json);
		this.setupProxy(function(){
			self.setupVhost(function(){
				logger.info('vhost proxy server 已启动');
				if(cb) cb();
			});
		});

	},
	stop: function(cb) {
		var self = this;
		this.stopProxy(function(){
			self.stopVhost(function(){
				logger.info('static proxy server 已关闭');
				if(cb) cb();
			});
		});
	},
	restart: function() {
		var self = this;
		this.stop(function(){
			self.start();
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
	_checkAllSetup: function(count, len, cb) {
		count++;
		if (count === len) cb();
	},
	setupVhost: function(cb) {
		var self = this;
		var len = self.vhosts.length;
		var currentCount = 0;

		if (!len) cb();

		this.vhosts.forEach(function(item, index) {
			var path = item.path,
			port = item.port,
			domain = item.domain;

			if (path && fs.exitsSync(path)) {
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
					self.bindStatic(req, res);
				});
				httpServer.on('clientError', function(err) {
					logger.error(err);
				});
				httpServer.listen(0, function() {
					self.routeList[domain] = httpServer.address().port;
					self.statics.push(httpServer);
					self._checkAllSetup(currentCount, len, cb);
				});
			} else if (port) {
				//配置端口转发	
				self.routeList[domain] = port;
				self._checkAllSetup(currentCount, len, cb);
			}
		});
	},
	setupProxy: function(cb) {
		
	},
	stopVhost: function(cb) {
		var self = this,
		len = this.statics.length,
		currentCount = 0;
		if (!len) cb();
		this.statics.forEach(function(server) {
			server.close(function() {
				self._checkAllSetup(currentCount, len, cb);
			});
		});
	},
	stopProxy: function(cb) {

	}
};

/**
*更新本地静态服务。同代理
*/
function updateVhostsServer() {
	//vhosts线程处理
	if (vhosts.list && vhosts.list.length > 0) {
		vhosts.process = vhosts.process || child_process.fork(vhosts.module);
		vhosts.process.send({
			type: "update",
			options: [vhosts.list]
		});

		//监听静态服务线程状态
		vhosts.process.on("exit", function() {
			vhosts.process = null;
			exitProcess("exit");
		});
		vhosts.process.on("message", function(m) {
			if (m && m.type === "exit") {
				vhosts.process = null;
				exitProcess(m.message);
			}
		});
		/*
		vhosts.process.on("error",function(err){
			logger.error(err);	
		});
		*/
	} else if (vhosts.process) {
		//不存在代理服务时，中断已开启的代理服务
		vhosts.process.send({
			type: "exit"
		});
	}
}

/**
*更新代理服务。存在代理规则，便开启一个代理服务线程，并将代理规则列表传递给该线程；不存在但已开启过代理服务，则中断已开启的代理服务，否则不处理。
*/
function updateProxyServer() {
	//proxy线程处理
	if (proxy.list && proxy.list.length > 0) {
		proxy.process = proxy.process || child_process.fork(proxy.module);
		proxy.process.send({
			type: "update",
			options: [proxy.list]
		});

		proxy.process.on("exit", function() {
			proxy.process = null;
		});
		proxy.process.on("message", function(m) {
			if (m && m.type === "exit") {
				logger.warn("代理服务线程已退出。" + m.message);
				proxy.process = null;
			}
		});
	} else if (proxy.process) {
		//不存在代理服务时，中断已开启的代理服务
		proxy.process.send({
			type: "exit"
		});
	}
}

exports.start = startup;
exports.stop = exitProcess;

