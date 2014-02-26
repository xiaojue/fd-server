function startServer(options) {
	var appconfig = options.appconfig;
	var configPath = options.path;
	var server = require("./index.js");
	var expr = require("../app.js");
	expr.listen(appconfig.port);
	server.start({
	    configFile: configPath,
	    appHost: appconfig
	});
}

var type = process.argv[2];
if(type === "open"){
    startServer({"appconfig":{port: 3003,domain: "www.sina-fds.com"},"path":__dirname.replace(/\\server/g,'') + "/config.json"});
}

module.exports = startServer;
