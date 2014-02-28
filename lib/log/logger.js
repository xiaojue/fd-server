var log4js = require("log4js");
var conf = require("./loggerConf.js");

log4js.configure(conf);

exports.getLogger = function (category, level){
    var logger = log4js.getLogger(category || 'all');
    logger.setLevel(level || 'DEBUG');
    return logger;
};