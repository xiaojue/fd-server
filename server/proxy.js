/**
*@description 代理服务
*@updateTime 2014-02-20/28 添加日志管理
*/
var logger = require('../lib/log/logger.js').getLogger("proxy");
var nproxy = require("nproxy");
var fs = require("fs");
var listFilePath = require("path").join(__dirname, "proxy_list.js");
var proxyPort = 8989;
var proxyServer = null;

function proxy(type, options){
    var fn = {
        "update": updateProxy,
        "exit": exitProcess
    };
    fn[type] && fn[type].apply(null,options);
}

function updateProxy(list){
    close();
    var listContent = "module.exports = " + JSON.stringify(list) + ";";
    // logger.info(listContent);
    fs.writeFile(listFilePath, listContent,function (err){
        if(err){
            logger.error("err");
            throw err;
        }
        logger.info("proxy rule list saved~!");
        start();
    });
    
    function start(){
        proxyServer = nproxy(proxyPort, {
            "responderListFilePath": listFilePath,
            "debug": false
        });
        logger.info("The proxy service has been updated~! ");
    }
}

function close(cb){
    if(proxyServer){
        for(var k in proxyServer){
            proxyServer[k] && proxyServer[k].close(function (){});
        }
    }
    fs.unlink(listFilePath,cb||function(){});
    // fs.writeFile(listFilePath, "module.exports = [];",function (err){});
}
//退出进程
function exitProcess(msg){
    if(exitProcess.ing){
        return;
    }
    exitProcess.ing = true;
    var msg = msg||"exit";
    logger.info('The proxy process will be exit~! by ' + msg);

    close(function(){
        logger.info("The proxy process has exited~!");
        process.exit();
    });
}

process.on("message", function (m){
    logger.debug("proxy " + m.type);
    proxy(m.type, m.options);
});
//监听进程中断信号
process.on('SIGINT', function() {
    exitProcess("SIGINT");
});

process.on('exit', function() {
    logger.debug("The proxy process has exited~!~~~~~~~~~~~~~~~~~~`````");
});

// exports.start = start;