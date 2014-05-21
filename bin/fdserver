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

program.parse(process.argv);

if (!program.args.length){
	program.help();
}

