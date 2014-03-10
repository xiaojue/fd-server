#!/usr/bin/env node
var fds = require("../lib/fdServer.js");
var pkg = require('../package.json');
var program = require('commander');

program.version(pkg.version);

program.usage('[command]');

var commandConfig = {
	'install': 'install the fd-server service',
	'start': 'start the fd-server service',
	'stop': 'stop the fd-server service',
	'restart': 'restart the fd-server service',
	'uninstall': 'uninstall the fd-server service'
};

for (var command in commandConfig) {
	program.command(command).description(commandConfig[command]).action(function() {
		fds({
			type: command
		});
	});
}

program.option('-l, --log [path]', 'set log filepath');
program.parse(process.argv);

if (program.log) {
	fds({
		type: "setLogPath",
		args: [program.log]
	});
} else if (!program.args.length) {
	program.help();
}

