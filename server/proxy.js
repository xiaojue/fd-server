/**
*@description 代理服务
*@updateTime 2014-02-20/10
*/

var nproxy = require("nproxy");
var fs = require("fs");
var listFilePath = process.cwd() + "/server/proxy_list.js";
var proxyPort = 8989;
var proxyServer = null;

function proxy(type, options){
    var fn = {
        "update": updateProxy
        // "exit": close
    };
    fn[type] && fn[type].apply(null,options);
}

function updateProxy(list){
    close();
    var listContent = "module.exports = " = JSON.stringify(list);
    fs.writeFile(listFilePath, listContent,function (err){
        if(err){
            throw err;
        }
        console.log("proxy rule list saved~!");
        start();
    });
    
    function start(){
        proxyServer = nproxy(proxyPort, {
            "responderListFilePath": listFilePath,
            "debug": true
        });
        console.log("The proxy service has been updated~! ");
    }
}

function close(){
    if(proxyServer){
        for(var k in proxyServer){
            proxyServer[k] && proxyServer[k].close(function (){
                console.log("proxy " + k + " closed~!");
            });
        }
    }
    fs.writeFile(listFilePath, "module.exports = []",function (err){});
}

process.on("message", function (m){
    console.log("proxy " + m.type);
    proxy(m.type, m.options);
});

process.on('SIGINT', function() {
  console.log("The proxy process will be exit~!");
  close();
  setTimeout(function (){
    console.log("The proxy process has exited~!");
    process.exit();
  }, 500);
});

exports.start = start;