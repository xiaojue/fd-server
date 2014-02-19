var nproxy = require("nproxy");
var fs = require("fs");
var listFilePath = process.cwd() + "/test/server/proxy_list.js";
var proxyPort = 8989;
var proxyServer = null;

function proxy(type, options){
    var fn = {
        "update": updateProxy
    };
    fn[type] && fn[type].apply(null,options);
}

function updateProxy(list){
    if(proxyServer){
        for(var k in proxyServer){
            proxyServer[k] && proxyServer[k].close(function (){
                console.log("proxy " + k + " closed~!");
            });
        }
    }
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
var proxyCfg = {
    "port": 8989,
    "responderListFilePath": listFile,
    "debug": true
}

function start(){
    nproxy(proxyCfg.port, proxyCfg);
    console.log("proxy............" + listFile);
}

//监听文件更新
// fs.watchFile(listFile,function (curr, prev){
    // if(curr.mtime > prev.mtime){
        // console.log("proxy config file update~! " + listFile);
        // process.exit("restart");
    // }
// });

// start();
process.on("message", function (m){
    console.log("proxy " + m.type);
    proxy(m.type, m.options);
});


exports.start = start;