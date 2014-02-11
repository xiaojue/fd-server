var SS = require('node-static');
var http = require('http');

//存放开启的server对象
var serverMap = {};

//随机生成一个未被占用的端口号
function getPort(){
    /** 生成端口号 尚未验证是否占用 */
    return parseInt(Math.random()*1000+8000);
}

//开启一个server
function startServer(options){
    var port = options.port;//端口
    var path = options.path;//路径
    var obj = serverMap[path];
    
    //判断是否已经开启了指定域名的server，若是则再判断配置是否完全相同，同则直接返回，否则关闭重启一个
    if(obj){
        if(!port || port == obj.port){
           return obj.port;
        }
        
        closeServer(obj["server"]);
    }
    port = port || getPort();
    obj = {};
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
    obj.ext = options.ext;
    serverMap[path] = obj;
    console.log("Server runing at port: " + port + ". path: " + path);
    return port;
}

//关闭server
function closeServer(server){
    server.close();
}


exports.start = startServer;
exports.close = closeServer;