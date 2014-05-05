/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 进驻到系统服务中的常驻js脚本
 */
var server = require('./server/index');
var utils = require('./utils');

server.start(utils.noop);
