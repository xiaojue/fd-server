/**
*@description 服务主线程入口
*@updateTime 2014-02-20/28 添加日志管理
*/
var fs = require("fs");
var child_process = require('child_process');
var path = require("path");
var expr = require("./app.js");
var logger = require('../lib/log/logger.js').getLogger("operate");
var ing = false;

var vhosts = {
    module: path.join(__dirname, "vhosts.js"),
    process: null,
    list: []
};
var proxy = {
    module: path.join(__dirname, "proxy.js"),
    process: null,
    list: []
};

var defaultOpitons = {
    appPort: 3003,
    appHost: "www.sina-fds.com",
    configFilePath: path.join(__dirname, "../config.json")
};

/**
*@description 获取配置信息并启动server
*@param options {
        configFilePath: "",//服务配置文件路径
        appPort: "" //express服务需要的端口
        appHost: "" //express服务需要的域名
    }
*/
function startup(options){
    if(ing){
        logger.info("服务已启用~！");
        return;
    }
    ing = true;
    
    var options = options || {};
    var path = options.configFilePath || defaultOpitons.configFilePath;
    var appPort = options.appPort || defaultOpitons.appPort;
    var appHost = options.appHost || defaultOpitons.appHost;
    
    //启动express Web服务
    expr.listen(appPort);
    fs.exists(path, function (t){
        if(t){
            //添加监听文件更新事件
            fs.watchFile(path,function (curr, prev){
                if(curr.mtime > prev.mtime){
                    logger.debug("config file update~! " + path);
                    _start();
                }
            });
            
            _start();
        }else{
            logger.warn("file not found. " + path);
        }
    });
    
    function _start(){
        //读取文件内容
        fs.readFile(path, {encoding: "utf8"}, function (err, data){
            if(err){
                throw err;
            }
            var obj = JSON.parse(data);
            
            //处理数据，然后更新服务
            if(dealData(obj)){
                updateVhostsServer();
                updateProxyServer();
            }
        });
    }
    function dealData(data){
        if(data){
            var vhostsCfg = data.vhost;
            var proxyCfg = data.proxy;
            var i, k, item, path;
            
            //初始化vhost配置数据
            vhosts.list = [];
            vhosts.list.push({
                port: appPort,
                domain: appHost,
                onlyRoute: true
            });
            for(k in vhostsCfg){
                vhosts.list.push({
                    path: vhostsCfg[k],
                    domain: k
                });
            }
            
            //处理代理服务配置数据
            proxy.list = [];
            for(k in proxyCfg){
                proxy.list.push({
                    pattern: k,
                    responder: proxyCfg[k]
                });
            }            
            return true;
        }
        return false;
    } 
}

/**
*更新本地静态服务。同代理
*/
function updateVhostsServer(){
    //vhosts线程处理
    if(vhosts.list && vhosts.list.length > 0){
        vhosts.process = vhosts.process || child_process.fork(vhosts.module);
        vhosts.process.send({
            type: "update",
            options: [vhosts.list]
        });
        
        vhosts.process.on("exit", function (){
            vhosts.process = null;
        });
    }else if(vhosts.process){
        //不存在代理服务时，中断已开启的代理服务
        vhosts.process.send({
            type: "exit"
        });
    }
}

/**
*更新代理服务。存在代理规则，便开启一个代理服务线程，并将代理规则列表传递给该线程；不存在但已开启过代理服务，则中断已开启的代理服务，否则不处理。
*/
function updateProxyServer(){
    //proxy线程处理
    if(proxy.list && proxy.list.length > 0){
        proxy.process = proxy.process || child_process.fork(proxy.module);
        proxy.process.send({
            type: "update",
            options: [proxy.list]
        });
        
        proxy.process.on("exit", function (){
            proxy.process = null;
        });
    }else if(proxy.process){
        //不存在代理服务时，中断已开启的代理服务
        proxy.process.send({
            type: "exit"
        });
    }
}

//退出进程
function exitProcess(msg){
    if(exitProcess.ing){
        return;
    }
    exitProcess.ing = true;
    logger.info('The service will be closed~! by ' + (msg||"stop"));
    vhosts.process ? vhosts.process.send({type:"exit"}) : '';
    proxy.process ? proxy.process.send({type:"exit"}) : '';
    
    setInterval(function (){
        if(!vhosts.process && !proxy.process){
            logger.info("The service process has exited~!");
            process.exit();
        }
    }, 100);
}
// process.on('uncaughtException', function(err){
  // console.error('uncaughtException: ' + err.message);
// });
//监听进程中断信号，然后延迟一秒退出，便于关闭相关服务
process.on('SIGINT', function() {
  exitProcess("SIGINT");
});

process.on("message", function (m){
    if(m.type === "exit"){
        exitProcess("message[exit]");
    }
});

process.on('exit', function() {
    logger.debug("The service has exited~!~~~~~~~~~~~~~~~~~~`````");
});

exports.start = startup;
exports.stop = exitProcess;
