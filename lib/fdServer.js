var Service = require('./systemService.js');
var http = require("http");
var path = require("path");
var fs = require("fs");

var options = {
    name: "fd-Server",
    description: "The nodejs web server. express_fdserver. ",
    script: path.join(__dirname, "sysMaster.js")
};

function start(){
    // console.log(options);
    //这里如果服务已经注册并处于开启状态，那么应该是只需要发送一个请求即可。
    //但目前不知道如何判定服务是否已经注册并且已启动的状态。
    Service.getService(options, function (svc){
        console.log("服务已注册，开启启动...");
        svc.start();
        //start后直接发get请求，会报connect ECONNREFUSED错误。
        //考虑可能是建立服务脚本没有执行完的原因,想不到好的处理办法，暂时就先延迟10s发请求。
        setTimeout(function(){http.get("http://127.0.0.1:8123/?type=start");}, 10000);
    });
}

function stop(){
    http.get("http://127.0.0.1:8123/?type=stop");
}

function removeService(){
    Service.remove(options);
}

module.exports = function (options){
    var options = options || {};
    var type = options.type || "";
    
    if(type === "start"){
        start();
    }
    
    if(type === "stop"){
        stop();
    }
    
    if(type === "removeService"){
        removeService();
    }
};

////////////////////////////////////////
var type = process.argv[2];
var fn = {
    start: start,
    stop: stop,
    remove: removeService
};

fn[type] && fn[type]();
// start();
// stop();