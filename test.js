function startServer(options) {
	var appconfig = options.appconfig;
	var configPath = options.path;
	var server = require("./server/index.js");
	var expr = require("./app.js");
	expr.listen(appconfig.port);
	server.start({
	    configFile: configPath,
	    appHost: appconfig
	});
}
// startServer({"appconfig":{port: 3000,domain: "www.sina-fds.com"},"path":"config.json"});
module.exports = startServer;
