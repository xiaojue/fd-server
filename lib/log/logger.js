var log4js = require("log4js");
var conf = require("./loggerConf.js");
var path = require("path");
var fs = require("fs");
var isInit = false;

//递归创建目录 同步
function mkdirsSync(dirname, mode){
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname), mode)){
            fs.mkdirSync(dirname, mode);
            return true;
        }
        
    }
}

function init(){
    var appenders = conf.appenders;
    var n = 0;
    
    for(var i = 0; i < appenders.length; i++){
        var appender = appenders[i];
        if(appender.filename){
            mkdirsSync(path.dirname(appender.filename));
        }
    }
    log4js.configure(conf);
}

exports.getLogger = function (category, level){
    !isInit ? init() : '';
    var logger = log4js.getLogger(category || 'all');
    logger.setLevel(level || 'DEBUG');
    return logger;
};