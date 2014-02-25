function startServer(options) {
    // console.log(typeof options);
	var appconfig = options.appconfig;
	var configPath = options.path;
	var server = require("./server/index.js");
	var expr = require("./app.js");
	expr.listen(appconfig.port);
    // console.log(configPath);
	server.start({
	    configFile: configPath,
	    appHost: appconfig
	});
}

var type = process.argv[2];
if(type === "start"){
    startServer({"appconfig":{port: 3003,domain: "www.sina-fds.com"},"path":"E:/workspace/express_fdserver/config.json"});
}

module.exports = startServer;

// console.log("server: " + __dirname);


// var spawn = require('child_process').spawn,
    // server = null;

// function startServer(){
    // console.log('start server');
    // server = spawn('node',['test.js']);
    // console.log('node js pid is '+server.pid);
    // server.on('close',function(code,signal){
        // server.kill(signal);
        // server = startServer();
    // });
    // server.on('error',function(code,signal){
        // server.kill(signal);
        // server = startServer();
    // });
    // return server;
// };

// startServer();