#!/usr/bin/env node
var fds = require("../lib/fdServer.js");
var pkg = require('../package.json');
var program = require('commander');

program.version(pkg.version);

program.usage('[command]');

program.command("install").description("install the fd-server service").action(function() {
	fds({
		type: "install"
	});
});
program.command("start").description("start the fd-server server").action(function() {
	fds({
		type: "start"
	});
});
program.command("stop").description("stop the fd-server server").action(function() {
	fds({
		type: "stop"
	});
});
program.command("uninstall").description("uninstall the fd-server service").action(function() {
	fds({
		type: "removeService"
	});
});

program.parse(process.argv);

if (!program.args.length) program.help();
