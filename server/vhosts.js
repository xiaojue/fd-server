var SS = require('node-static');
var http = require('http');
var route = require("./route");

var serverMap = {};//存放开启的server对象,key为path
var routeList = {};//路由列表 key为domain value为port

/**
*@description 随机生成一个未被占用的端口号
*@return 一个未被占用的端口号
*   端口是否被占用目前不知道如何实现，因此并未验证。目前生成的端口范围是8000~9000
*/
function getPort(){
    return parseInt(Math.random()*1000+8000);
}

/**
*@description vhosts入口方法
*/
function vhosts(methodName, options){
    var fn = {
        // "start": startServer,
        // "close": close,
        // "restart": startServer,
        "update": update
    };
    fn[methodName] && fn[methodName].apply(null,options);
}

/**
*@description 开启一个server 返回监听的端口号
*@param options {Object}: {
*                   path: "服务路径",
*                   domain: "域名",
*                   ext: {} //服务扩展参数 可选
*                }
*       flag {Boolean}: true/false 是否要启动/重启路由，默认true
*@return port 服务监听的端口号
*/
function startServer(options, flag){
    var port = options.port;//端口
    var path = options.path;//路径
    var domain = options.domain;//域名
    var obj = serverMap[path] || {};
    var flag = typeof flag === "undefined" || flag;
    
    //是否指定端口，没有则生成一个
    port = obj.port || port || getPort();
    
    if(!obj.server){
        //启动server
        var fileServer = new SS.Server(path, options.ext);
        var server = http.createServer(function (request, response) {
            request.addListener('end', function () {
                fileServer.serve(request, response, function (err, result) {
                    if(err){
                        response.writeHead(err.status, err.headers);
                        response.end();
                    }
                });
            }).resume();
        }).listen(port); 
        console.log("Server runing at port: " + port + ". path: " + path);
        
        //将开启的server对象存放在map中
        obj.server = server;
        obj.path = path;
        obj.port = port;
        obj.domains = "";
        obj.ext = options.ext;
        serverMap[path] = obj;
    }
    if(obj.domains.indexOf(domain) === -1){
        obj.domains = obj.domains + domain + ";";
    }
    routeList[domain] = port;
    console.log(domain + ": "+ port);
    flag ? routeStart() : '';
    return port;
}

/**
*@description 启动/更新服务
*@param list {Array} 要启动的服务列表
*/
function update(list){
    if(list && list instanceof Array){
        //将不需要的已开启服务关闭
        var listStr = JSON.stringify(list);
        for(var path in serverMap){
            if(listStr.indexOf(path) === -1){
                close(path);
            }
        }
        
        routeList = {};
        //循环开启服务
        for(var i = 0; i < list.length; i++){
            var item = list[i];
            startServer(item, false);
        }
    }
    //启动路由服务
    routeStart();
}

//启动/重启 路由
function routeStart(){
    route.start(routeList);
}

/**
*@description 关闭服务
*@param path {String} 需要关闭的服务路径 
*/
function close(path){
    if(path && serverMap[path] && serverMap[path].server){
        serverMap[path].server.close();
        delete serverMap[path];
    }
}

process.on("message", function (m){
    vhosts(m.method, m.options);
});

exports.vhosts = vhosts;