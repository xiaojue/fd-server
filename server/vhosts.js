/**
*@description 本地静态服务
*@updateTime 2014-02-20/10
*/

var SS = require('node-static');
var http = require('http');
var route = require("./route");

var routeList = {};//路由列表 key为domain value为port
var staticPaths = {};//存放开启的server对象,key为path
//计数器，用于判断哪些服务配置规则发生了变化
var getNum = (function (){
        var n = 0;
        return function (){
            return ++n;
        };
    })();
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
function vhosts(type, options){
    var fn = {
        // "start": startServer,
        // "exit": exit,
        // "restart": startServer,
        "update": update
    };
    fn[type] && fn[type].apply(null,options);
}

/**
*@description 开启一个server 返回监听的端口号
*@param path {String}: 需要开启服务的文件路径，必选
*       port {Number}: 端口号，可选
*       options {Object}: 扩展对象
*@return {Object}: {
*           port: ,
*           path: ,
*           server: 
*        }
*/
function startServer(path, port, options){
    var port = port || getPort();//端口
    
    //启动server
    var fileServer = new SS.Server(path, options);
    var server = http.createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response, function (err, result) {
                if(err){
                    response.writeHead(err.status, err.headers);
                    response.end();
                }
            });
        }).resume();
    });
    
    server.listen(port);
    console.log("Server runing at port: " + port + ". path: " + path);
    server.on("close", function (){
        console.log("static server closed~! " + path);
    });
    return {
        path: path,
        port: port,
        server: server
    };
}

/**
*@description 启动/更新服务
*@param list {Array} 要启动的服务列表
*/
function update(list){
    if(list && list instanceof Array && list.length > 0){
        var cur_n = getNum(), i = 0, item, path, domain, result;
        routeList = {};//初始路由列表
        
        for(; i < list.length; i++){
            item = list[i];
            path = item.path;
            domain = item.domain;
            
            //通过路径判断，该路径是否存在已开启了静态服务。
            //若存在，则标识并将域名指向添加到路由列表中；
            //若不存在，则开启一个，然后保存、标识并将域名指向添加到路由列表中
            if(path && domain){
                if(staticPaths[path]){
                    staticPaths[path]._n = cur_n;
                    routeList[domain] = staticPaths[path].port;
                }else{
                    result = startServer(path);
                    if(!result || result.err){
                        console.warn("static-server start fail~! path: " + path + ", port: " + port + ", err: " + err);
                    }else{
                        result._n = cur_n;
                        staticPaths[path] = result;
                        routeList[domain] = result.port;
                    }
                }
            }
            
            //仅添加路由服务，需要指定域名和端口。
            if(item.onlyRoute){
                routeList[domain] = item.port;
            }
            
        }
        //启动更新路由服务
        routeStart();
        
        //关闭清除不需要的服务
        var _paths = {};
        for(var k in staticPaths){
            item = staticPaths[k];
            if(item._n === cur_n){
                _paths[k] = item;
            }else{
                close(item.server);
            }
        }
        staticPaths = _paths;
    }else{
        close();
    }
}

//启动/重启 路由
function routeStart(){
    route.start(routeList);
}

/**
*@description 关闭服务
*@param server {Server} 需要关闭的服务 可选
*/
function close(server){
    if(server){
        server.close();
    }else{
        var ports = "";
        for(var k in staticPaths){
            staticPaths[k].server.close();
            ports += staticPaths[k].port + ",";
        }
        staticPaths = {};
        
        var rlist = routeList;
        routeList = {};
        for(var k in rlist){
            if(! new RegExp(rlist[k]+",").test(ports)){
                routeList[k] = rlist[k];
            }
        }
        routeStart();
    }
}

function exit(){
    route.exit();
}

process.on("message", function (m){
    console.log("vhosts " + m.type);
    vhosts(m.type, m.options);
});

process.on('SIGINT', function() {
  console.log("The vhosts process will be exit~!");
  exit();
  setTimeout(function (){
    console.log("The vhosts process has exited~!");
    process.exit();
  }, 500);
});

// exports.vhosts = vhosts;