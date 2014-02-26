var WinService = require("node-windows").Service;
var fs = require("fs");

/**
*@description 获取一个系统服务对象，该方法会注册一个系统服务并返回该服务对象。
*/
function getService(options, cb){
    var script = options.script;
    var cb = cb || function (){};
    var svc = null;
    var name, description;
    fs.exists(script, function (t){
        if(t){
            name = options.name || (script.match(/\w+\.js$/g)||[])[1];
            description = options.description || '';
            svc = new WinService({
                name: name,
                description: description,
                script: script
            });
            svc.on("install", function (){
                console.log("install~!");
                cb(svc);
            });
            
            svc.on("alreadyinstalled", function (){
                console.log("alreadyinstalled~!");
                cb(svc);
            });
            svc.install();
        }
    });
}

/**
*@description 移除一个已注册的系统服务
*/
function remove(options, cb){
    var script = options.script;
    var cb = cb || function (){};
    var svc = null;
    var name, description;
    
    fs.exists(script, function (t){
        if(t){
            name = options.name || (script.match(/\w+\.js$/g)||[])[1];
            description = options.description || '';
            svc = new WinService({
                name: name,
                description: description,
                script: script
            });
            
            svc.on("uninstall", function (){
                console.log(name + " uninstall~!");
                cb(true);
            });
            svc.uninstall();
        }
    });
}

exports.remove = remove;
exports.getService = getService;