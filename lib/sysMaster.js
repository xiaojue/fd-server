var http = require('http'); 
var url = require('url');
var path = require("path");
var cluster = require('cluster');
var fork = require('child_process').fork;
var logger = require('./log/logger.js').getLogger("operate");
var script = path.join(__dirname, "../server/start.js");
var server = null;

if(cluster.isMaster) {
    function createWorker(){
        return  cluster.fork();
    }
    createWorker();
    //当服务的子线程挂掉时，重启一个    
    cluster.on('exit', function(worker, code, signal) {
        logger.info('[master] worker ' + worker.process.pid + ' died' +", code: " + code + ", signal: " + signal);
        createWorker();
    });
} else {
    var hts = http.createServer(function (req, res) {
        logger.info("请求: " + req.url);
        var gdata = url.parse(req.url,true).query;
        var type = gdata.type;
        // logger.info("type: " + type);
        // var options = JSON.parse(gdata.options || "{}");
        type ? deal(type,{}) : "";

        res.writeHead(200, {'Content-Type': 'text/plain'}); 
        res.end('OK\n'); 
    });
    hts.on("error", function(err) {
        deal("stop");
        logger.error("127.0.0.1:8123 --> error~!");
        logger.debug(err);
        process.exit();
    });
    hts.on("close", function() {
        deal("stop");
        logger.debug("127.0.0.1:8123 --> close~!");
    });
    hts.listen(8123, "127.0.0.1");
    logger.info("[worker" + cluster.worker.process.pid + ']Server running at http://127.0.0.1:8123/'); 
    
    //出现异常时，打印错误信息，不退出进程。
    process.on('uncaughtException', function(err) {
        logger.error('worker uncaughtException  ' + err.message);
        logger.error(err);
    });
}

//根据请求的不同指令，做出对应处理。
function deal(type, options){
    // logger.info(server); 
    var fn = {
        "start": start,
        "stop":stop,
        "restart":restart
    };
    
    // logger.info("script: " + script);
    if(fn[type]){
        fn[type].apply(null, options);
    }else{
        logger.info("type参数无效~");
        logger.info("server --->" + server);
        if(type === "throw"){
            throw "主动throw 异常测试。";
        }
    }
    
    function start(){
        if(!server){
            server = fork(script, [], {cwd: path.join(__dirname, "../")});
            
            server.on("exit", function (){
                logger.error("sysMaster: server exit~!");
                server = null;
            });
        }
    }
    
    function stop(){
		logger.info('stop');
        if(server){
            server.send({type: "exit"});
            server = null;
            logger.debug("sysMaster: server exists， and stoped.");
        }
    }
    
    function restart(){
        logger.info("服务重启中...");
        stop();
        setTimeout(start,1000);
    }
}
