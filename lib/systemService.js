var fs = require("fs");
var logger = require('./log/logger.js').getLogger("operate");
var sName = {
    "win32": "node-windows",
    "linux": "node-linux",
    "darwin": "node-mac"
}[process.platform];
var sysService = require(sName).Service;

/**
*@description 获取一个系统服务对象，该方法会注册一个系统服务并返回该服务对象。
*/
function getService(options, cb){
    var script = options.script;
    cb = cb || function (){};
    var svc = null;
    var name, description;
    fs.exists(script, function (t){
        if(t){
            name = options.name || (script.match(/\w+\.js$/g)||[])[1];
            description = options.description || '';
            svc = new sysService({
                name: name,
                description: description,
                script: script
            });
            //判断服务是否存在，存在就直接把svc对象返回，不存在时安装然后返回。
            if(svc.exists){
                cb(svc);
            }else{
                svc.on("install", function (){
                    logger.info("服务注册成功!");
                    cb(svc);
                });
                svc.install();
            }
        }
    });
}

/**
*@description 移除一个已注册的系统服务
*/
function remove(options, cb){
    var script = options.script;
    cb = cb || function (){};
    var svc = null;
    var name, description;
    
    fs.exists(script, function (t){
        if(t){
            name = options.name || (script.match(/\w+\.js$/g)||[])[1];
            description = options.description || '';
            svc = new sysService({
                name: name,
                description: description,
                script: script
            });
            
            svc.on("uninstall", function (){
                logger.info(name + " 服务被注销");
                cb(true);
            });
            svc.uninstall();
        }
    });
}

exports.remove = remove;
exports.getService = getService;
