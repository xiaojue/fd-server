var bouncy = require('bouncy');
var fs = require("fs");

var server = null;
var routeList = {};

function start(list){
    //可添加判断路由列表是否发生变化
    routeList = list;
    if(server){
        server.close(function (){
            console.log("close route (restart): " + arguments);
        });
    }
    server = bouncy(function (req, res, bounce){
        var port = routeList[req.headers.host];
        console.log("route: "+req.headers.host);
        if(port){
            console.log("route: "+port);
            bounce(port);
        }else{
            res.statusCode = 404;
            res.end("no such host");
        }
    });
    server.listen(80);
}

//添加指定的domain指向
function add(port, domain){
    var _port = routeList[domain];
    if(_port && _port == port){
        return;
    }
    routeList[domain] = port;
    start(routeList);
}

//移除指定的domain指向
function remove(domain){
    if(routeList[domain]){
        delete routeList[domain];
        start(routeList);
    }
}

function close(){
    server && server.close(function (){
        console.log("close route: " + arguments);
        routeList = {};
    });
    routeList = {};
}

exports.start = start;
exports.add = add;
exports.remove = remove;