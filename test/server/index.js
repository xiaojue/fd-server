var fs = require("fs");
var md5 = require("MD5");
var child_process = require('child_process');
var fileListen = false;
var vhosts = {
    module: "./test/server/vhosts",
    process: null,
    list: {}
};
var proxy = {
    module: "./test/server/proxy",
    process: null,
    list: []
};
//计数器，用于判断哪些服务配置规则发生了变化
var getNum = (function (){
        var n = 0;
        return function (){
            return ++n;
        };
    })();

//获取配置信息并启动server/更新server
function startup(path){
    fs.exists(path, function (t){
        if(t){
            //添加监听文件更新事件
            if(!fileListen){
                fs.watchFile(path,function (curr, prev){
                    if(curr.mtime > prev.mtime){
                        console.log("config file update~! " + path);
                        startup(path);
                    }
                });
                fileListen = true;
            }
            //读取文件内容
            fs.readFile(path, {encoding: "utf8"}, function (err, data){
                if(err){
                    throw err;
                }
                eval('var obj = ' + data);
                
                //处理数据，然后更新服务
                if(dealData(obj)){
                    updateVhostsServer();
                    updateProxyServer();
                }
            });
        }else{
            console.warn("file not found. " + path);
        }
    });
    
    function dealData(data){
        if(data){
            var _n = getNum();//标识本次处理的数字
            var vhostsCfg = data.vhosts;
            var proxyCfg = data.proxys;
            var i, item, domain, path;
            
            //处理vhost配置数据
            for(i = 0; i < vhostsCfg.length; i++){
                item = vhostsCfg[i];
                domain = item.domain;
                path = item.path;
                vhosts.list[domain] = {
                    path: item.path,
                    port: item.port,
                    ext: item.ext,
                    _n: _n
                };
            }
            vhosts._latest = _n;
            
            //处理代理服务配置数据
            proxy.list = [];
            for(i = 0; i < proxyCfg.length; i++){
                item = proxyCfg[i];
                proxy.list.push({
                    pattern: item.pattern,
                    responder: item.responder
                });
            }
            
            return true;
        }
        return false;
    } 
}

//更新本地静态服务
function updateVhostsServer(){
    //vhosts线程处理
    vhosts.process = vhosts.process || child_process.fork(vhosts.module);
    vhosts.process.send({
        type: "update",
        options: [vhosts.list, vhosts._lastest]
    });
    vhosts.process.on("close", function(){
        console.log("vhosts.process closed~！");
    });
}

//更新代理服务
function updateProxyServer(){
    //proxy线程处理
    proxy.process = proxy.process || child_process.fork(proxy.module);
    proxy.process.send({
        type: "update",
        options: [proxy.list]
    });
    proxy.process.on("close", function(){
        console.log("proxy.process closed~！");
    });
}

process.on('uncaughtException', function(err){
  console.error('uncaughtException: ' + err.message);
});

exports.start = init;