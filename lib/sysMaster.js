var http = require('http'); 
var url = require('url');
var path = require("path");
var cluster = require('cluster');
var fork = require('child_process').fork;
var script = path.join(__dirname, "../start.js");
var server = null;

if(cluster.isMaster) {
    for (var i = 0; i < 1; i++) {
        cluster.fork();
    }
    //当服务的子线程挂掉时，重启一个
    cluster.on('exit', function(worker, code, signal) {
        console.log('[master] worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {
    http.createServer(function (req, res) { 
        console.log(req.url);
        var gdata = url.parse(req.url,true).query;
        var type = gdata.type;
        // console.log("type: " + type);
        // var options = JSON.parse(gdata.options || "{}");
        type ? deal(type,{}) : "";

        res.writeHead(200, {'Content-Type': 'text/plain'}); 
        res.end('OK\n'); 
    }).listen(8123, "127.0.0.1");
    console.log("[worker" + cluster.worker.process.pid + ']Server running at http://127.0.0.1:8123/'); 
}

//根据请求的不同指令，做出对应处理。
function deal(type, options){
    // console.log(server); 
    var fn = {
        "start": start,
        "stop":stop,
        "restart":restart
    };
    
    // console.log("script: " + script);
    if(fn[type]){
        fn[type].apply(null, options);
    }else{
        console.log("type参数无效~");
    }
    
    function start(){
        if(!server){
            server = fork(script, [], {cwd: path.join(__dirname, "../")});
        }
        // console.log("服务开启~！");
    }
    
    function stop(){
        if(server){
            server.send({type: "exit"});
            server = null;
        }
        // console.log("服务关闭~！");
    }
    
    function restart(){
        console.log("服务重启中...");
        stop();
        setTimeout(start,1000);
    }
}
