var http = require('http'); 
var url = require('url');
var cluster = require('cluster');
var fork = require('child_process').fork;
var server = null;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < 1; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('[master] worker ' + worker.process.pid + ' died');
    cluster.fork();
  });
} else {
    // Workers can share any TCP connection
    // In this case its a HTTP server
    http.createServer(function (req, res) { 
        console.log(req.url);
        var gdata = url.parse(req.url,true).query;
        var type = gdata.type;
        // var options = JSON.parse(gdata.options || "{}");
        // type ? deal(type, {}) : "";

        res.writeHead(200, {'Content-Type': 'text/plain'}); 
        res.end('OK\n'); 
    }).listen(8123, "127.0.0.1");
    console.log("[" + cluster.worker.process.pid + ']Server running at http://127.0.0.1:8124/'); 
}

function deal(type, options){
    console.log(server); 
    
    var fn = {
        "start": start,
        "stop":stop,
        "restart":restart
    };
    var script = __dirname + "/server.js";
    
    // console.log("script: " + script);
    if(fn[type]){
        fn[type].apply(null, options);
    }else{
        console.log("type参数无效~");
    }
    
    function start(){
        if(!server){
            server = fork(script,["start"],{cwd: __dirname});
            
            // server.stdout.on('data', function (data) {
              // console.log('[SERVER]: ' + data);
            // });

            // server.stderr.on('data', function (data) {
              // console.log('[SERVER]-ERR: ' + data);
            // });

            // server.on('close', function (code) {
              // console.log('[SERVER]-CLOSE: ' + code);
            // });
        }
        console.log("服务开启~！");
    }
    
    function stop(){
        if(server){
            console.log("kill " + server.pid);
            server.send({type:"exit"});
            server = null;
        }
        console.log("服务关闭~！");
    }
    
    function restart(){
        console.log("服务重启中...");
        stop();
        // setTimeout(start,1000);
    }
}
