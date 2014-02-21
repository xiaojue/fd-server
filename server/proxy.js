/**
*@description 代理服务
*@updateTime 2014-02-20/17
*/

var nproxy = require("nproxy");
var fs = require("fs");
var listFilePath = process.cwd() + "/server/proxy_list.js";
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
    // console.log(listContent);
    fs.writeFile(listFilePath, listContent,function (err){
        if(err){
            console.log("err");
            throw err;
        }
        console.log("proxy rule list saved~!");
        start();
    });
    
    function start(){
        proxyServer = nproxy(proxyPort, {
            "responderListFilePath": listFilePath,
            "debug": false
        });
        console.log("The proxy service has been updated~! ");
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
function exitProcess(){
    console.log("The proxy process will be exit~!");
    close(function(){
        console.log("The proxy process has exited~!");
        process.exit();
    });
}

process.on("message", function (m){
    console.log("proxy " + m.type);
    proxy(m.type, m.options);
});
//监听进程中断信号
process.on('SIGINT', function() {
    exitProcess();
});

// exports.start = start;