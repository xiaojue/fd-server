var SS = require('node-static');
var http = require('http');
var route = require("./route");
var hosts = require("./hosts");

var serverMap = {};//存放开启的server对象
var routeList = {};//路由列表

//随机生成一个未被占用的端口号
function getPort(){
    /** 生成端口号 尚未验证是否占用 */
    return parseInt(Math.random()*1000+8000);
}

function vhosts(methodName, options){
    var fn = {
        "start": startServer,
        "batchStart": batchStart,
        "close": closeServer,
        "restart": startServer
    };
    console.log(methodName);
    fn[methodName] && fn[methodName].apply(null,options);
}

//开启一个server 返回监听的端口号
function startServer(options, flag){
    var port = options.port;//端口
    var path = options.path;//路径
    var domain = options.domain;//域名
    var obj = serverMap[path] || {};
    var flag = typeof flag === "undefined" || flag;
    
    //判断是否已经开启了指定域名的server，若是则再判断配置是否完全相同，同则直接返回，否则关闭重启一个
    /* if(obj){
        //暂不处理端口修改
        if(!port || port == obj.port){
           port = obj.port;
        }else{
            closeServer(obj);
            obj.server = null;
        }
    } */
    
    
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
        
        //将开启的server对象存放在map中
        obj.server = server;
        obj.path = path;
        obj.port = port;
        obj.domains = {};
        obj.ext = options.ext;
        serverMap[path] = obj;
        console.log("Server runing at port: " + port + ". path: " + path);
    }
    obj.domains[domain] = 1;
    routeList[domain] = port;
    flag ? routeStart() : '';
    hosts.set(domain);//绑定hosts
    return port;
}

function batchStart(list){
    if(list && list instanceof Array){
        for(var i = 0; i < list.length; i++){
            var item = list[i];
            var port = startServer(item, false);
            port ? routeList[item["domain"]] = port : '';
        }
    }
    routeStart();
}

//启动/重启 路由
function routeStart(){
    route.start(routeList);
}

//关闭server
function closeServer(options){
    var server = options["server"] || serverMap[options["path"]];
    if(server){
        server.close();
    }
    hosts.remove(domain);
    route.remove(domain);
}



process.on("message", function (m){
    vhosts(m.method, m.options);
});

exports.vhosts = vhosts;