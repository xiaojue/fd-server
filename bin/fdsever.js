#!/usr/bin/env node
var fds = require("../lib/fdServer.js");
var pkg = require('../package.json');
var program = require('commander');

program.version(pkg.version);

program.command("install").description("install the fd-server service").action(function() {
	fds({
		type: "install"
	});
});
program.command("start").description("open local development environment and register local system server").action(function() {
	fds({
		type: "start"
	});
});
program.command("stop").description("exit local development environment").action(function() {
	fds({
		type: "stop"
	});
});
program.command("remove").description("remove register local system server").action(function() {
	fds({
		type: "removeService"
	});
});
program.parse(process.argv);

