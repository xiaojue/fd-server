#!/usr/bin/env node
var server = require("../test.js");
var path = require('path');
var program = require('commander');
var pkg = require('../package.json');
process.chdir(process.cwd().replace(/\\bin/g, ''));
var pid = process.pid;
program.version(pkg.version);
// program.option('-c, --config <path>', 'set the config file');
program.command("start").description("open local development environment").action(start);
program.command("stop").description("exit local development environment").action(stop);
program.parse(process.argv);


//启动本地服务列表
function start() {
	var d = path.resolve(process.cwd(), "config.json");
	server({"appconfig":{"port": 3000,"domain": "www.sina-fds.com"},"path":d});
}

//关闭本地服务列表
function stop(){
	// process.on('SIGINT', function() {
 // 		console.log('Got SIGHUP signal.');
 // 		setTimeout(function() {
	// 	  	console.log('Exiting.');
	// 	  	process.exit(0);
	// 	}, 100);
	// });
	// process.kill(pid, 'SIGINT');
}

