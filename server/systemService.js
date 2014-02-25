var WinService = require("node-windows").Service;
var fs = require("fs");

function register(options, cb){
    var script = options.script;
    var cb = cb || function (){};
    var svc = null;
    var isStart = typeof options.isStart === "undefined" ? true : options.isStart;
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
            
            if(isStart){
                svc.on("install", function (){
                    svc.start();
                });
                
                svc.on("alreadyinstalled", function (){
                    console.log("alreadyinstalled ");
                    svc.start();
                });
                
                svc.on("start", function (){
                    console.log("start ..");
                });
            }
            svc.install();
            cb(svc);
        }
    });
}

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
                cb(svc);
            });
            
            svc.on("alreadyinstalled", function (){
                cb(svc);
            });
            svc.install();
        }
    });
}

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

exports.register = register;
exports.remove = remove;
exports.getService = getService;