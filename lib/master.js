/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 进驻到系统服务中的常驻js脚本
 */

var path = require('path');
var config = require('./sysconfig');
var server = require('./server/index');
var log = require('./log/logger.js');
var logger = log.getLogger('operate');
var utils = require('./utils');


server.start(utils.noop);
