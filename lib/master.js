/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 进驻到系统服务中的常驻js脚本
 */

var path = require('path');
var config = require('./sysconfig');
var server = require('./server/index');

server.start({
	appPort: config.uipage.port,
	appHost: config.uipage.host,
	configFilePath: path.join(__dirname, '../config.json')
});

