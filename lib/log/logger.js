/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 日志管理
 */
var log4js = require("log4js");
var path = require('path');
var logfile = path.resolve(__dirname,'../../fdserver.log');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(logfile),'FDS');
module.exports = log4js.getLogger('FDS');

