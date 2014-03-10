#!/usr/bin/env node
var fds = require("../lib/commanders.js");
var pkg = require('../package.json');
var program = require('commander');

program.version(pkg.version);

program.usage('[command]');

var key;

for (key in fds.commanders) {
	var commander = fds.commanders[key];
	program.command(key).description(commander['description']).action(commander['exec']);
}

for (key in fds.options){
	var option = fds.options[key];
	program.option(option['command'],option['description']);
}

program.parse(process.argv);

if (!fds.optionsChecks(program) && !program.args.length){
	program.help();
}

