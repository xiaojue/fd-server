var bouncy = require('bouncy');
var fs = require("fs");
var hosts = require("./hosts");

var server = null;
var routeList = {};

function start(list){
    //判断路由列表是否发生变化
    if(!isChange(list)){
        return;
    }
    //存在已有的路由，则先关闭
    if(server){
        console.log("重启路由中...");
        server.close(function (){
            route(list);
        });
    }else{
        //开启路由
        route(list);
    }
    
    //更新绑定hosts
    var listStr = JSON.stringify(list);
    //先移除不再需要绑定的hosts
    for(var dm in routeList){
        if(listStr.indexOf(dm) === -1){
            hosts.remove(dm);
        }
    }
    //添加新增的绑定hosts
    for(var dm in list){
        if(!routeList[dm]){
            hosts.set(dm);
        }
    }
    routeList = list;
}

function route(list){
    //开启路由
    server = bouncy(function (req, res, bounce){
        var port = list[req.headers.host];
        // console.log("route: "+req.headers.host);
        if(port){
            // console.log("route: "+port);
            bounce(port);
        }else{
            res.statusCode = 404;
            res.end("no such host");
        }
    });
    server.on("error", function (err){
        console.log(err);
    });
    server.on("close", function (){
        console.log("路由已关闭！");
    });
    server.on("listening", function (){
        console.log("路由已启用！");
    });
    server.listen(80);
}

//判断路由列表是否发生变化
function isChange(list){
    var n1 = (JSON.stringify(list).match(/,/g) || []).length;//list个数
    var n2 = (JSON.stringify(routeList).match(/,/g) || []).length;//routeList个数
    
    if(n1 !== n2){
        return true;
    }
    for(var dm1 in routeList){
        var t = true;
        t:for(var dm2 in list){
            if(dm1 == dm2 && routeList[dm1] == list[dm2]){
                t = false;
                break t;
            }
        }
        
        if(t){
            return true;
        }
    }
    return false;
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