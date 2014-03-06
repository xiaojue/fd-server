var log4js = require("log4js");
var path = require("path");
var fs = require("fs");
var confPath = path.join(__dirname, "./conf.json");
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

//初始化日志配置数据
function init(logPath){
    var conf = fs.readFileSync(confPath);
    conf = JSON.parse(conf);

    var appenders = conf.appenders;
    if(logPath){
        conf.dirname = logPath;
        fs.writeFileSync(confPath, JSON.stringify(conf));
    }

    var dirname = conf.dirname || path.join(__dirname, "../../");
    
    for(var i = 0; i < appenders.length; i++){
        var appender = appenders[i];
        var filename = appender.filename;
        if(filename && /^\./.test(filename)){
            appender.filename = path.join(dirname, filename);
            mkdirsSync(path.dirname(appender.filename));
        }
    }
    
    //运行时配置
    var _conf = path.join(__dirname, "./_conf.json");
    fs.writeFileSync(_conf, JSON.stringify(conf));
    log4js.configure(_conf);
    isInit = true;
}

exports.getLogger = function (category, level){
    !isInit ? init() : '';
    var logger = log4js.getLogger(category || 'all');
    logger.setLevel(level || 'DEBUG');
    return logger;
};

exports.setLogPath = function (logPath){
    init(logPath);
};