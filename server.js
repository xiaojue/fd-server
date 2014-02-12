var fs = require("fs");
var ss = require("./server/ss.js");
var hosts = require("./server/hosts.js");
var route = require("./server/route.js");

function deal(data){
    var routes = {};
    var server = data.server;
    for(var i = 0; i < server.length; i++){
        var domain = server[i].domain;
        var port = ss.start(server[i]);//¿ªÆôserver£¬·µ»Ø¶Ë¿ÚºÅ
        routes[domain] = port;
        hosts.set(domain);
    }
    route.start(routes);
}

function start(){
    var path = "./test-config.json";
    fs.exists(path, function (t){
        if(t){
            fs.readFile(path, function (err, data){
                if(err){
                    throw err;
                }
                eval('var obj = ' + data);
                deal(obj);
            })
        }else{
            console.warn("file not found. " + path);
            // callback(null);
        }
    });
}

start();
console.log("process: " + process.pid);