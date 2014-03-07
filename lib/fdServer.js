var Service = require('./systemService.js');
var logger = require('./log/logger.js').getLogger("operate");
var http = require("http");
var path = require("path");
var fs = require("fs");

var options = {
	name: "fd-Server",
	description: "The nodejs web server. express_fdserver. ",
	script: path.join(__dirname, "sysMaster.js")
};

function start() {
	// logger.info(options);
	//这里如果服务已经注册并处于开启状态，那么应该是只需要发送一个请求即可。
	//但目前不知道如何判定服务是否已经注册并且已启动的状态。
	http.get("http://127.0.0.1:8123/?type=start", function(res) {
		logger.info('服务已经启动');
		process.exit();
	}).on('error', function() {
		Service.getService(options, function(svc) {
			logger.info("服务已注册，开启启动...");
			svc.on('start', function() {
				http.get("http://127.0.0.1:8123/?type=start").on('error', function() {
					svc.emit('start');
				});
			});
			svc.start();
		});
	});
}

function install() {
	// logger.info(options);
	//这里如果服务已经注册并处于开启状态，那么应该是只需要发送一个请求即可。
	//但目前不知道如何判定服务是否已经注册并且已启动的状态。
	Service.getService(options);
}

function stop(cb) {
	http.get("http://127.0.0.1:8123/?type=stop", function(res) {
		logger.info('服务已经关闭');
		if (cb) cb();
		else process.exit();
	}).on("error", function(e) {
		logger.info("请确认服务是否开启~ ! err: " + e.message);
	});
}

function restart() {
	http.get("http://127.0.0.1:8123/?type=restart", function(res) {
		process.exit();
	}).on("error", function(e) {
		// logger.info("Got error: " + e.message);
        start();
	});
}

function removeService() {
	Service.remove(options);
}

function setLogPath(logPath){
    require('./log/logger.js').setLogPath(logPath);
    logger.info("日志路径已变更，需要大概一分钟后生效，若无变更，请尝试重启服务。");
}

module.exports = function(options) {
	options = options || {};
	var type = options.type || "";
    var fn = {
        "install": install,
        "start": start,
        "stop": stop,
        "restart": restart,
        "removeService": removeService,
        "setLogPath": setLogPath
    };
	
    if(fn[type]){
        fn[type].apply(null, options.args);
    }else{
        logger.info("无效命令");
    }
};

