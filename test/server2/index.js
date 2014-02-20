var C = require("./config.js");
var fs = require("fs");
var child_process = require('child_process');

var vhosts = {
    module: "./server/vhosts",
    process: null,
    list: []
};

//初始化数据
function init(path){
    fs.exists(path, function (t){
        if(t){
            //监听文件更新
            fs.watchFile(path,function (curr, prev){
                if(curr.mtime > prev.mtime){
                    console.log("config file update~! " + path);
                    startup(path);
                }
            });
            
            startup(path);
        }else{
            console.warn("file not found. " + path);
        }
    });
}

//获取配置信息并启动server/更新server
function startup(path){
    fs.exists(path, function (t){
        if(t){
            fs.readFile(path, {encoding: "utf8"}, function (err, data){
                if(err){
                    throw err;
                }
                vhosts.list = [];
                eval('var obj = ' + data);
                if(parseData(obj)){
                    updateServer();
                }
            });
        }else{
            console.warn("file not found. " + path);
        }
    });
}

function updateServer(){
    vhosts.list.push(C.express);
    vhosts.process = vhosts.process || child_process.fork(vhosts.module);
    vhosts.process.send({
        method: "update",
        options: [vhosts.list]
    });
}

function parseData(data){
    if(data){
        var vhostsCfg = data.vhost;
        for(var k in vhostsCfg){
            var item = vhostsCfg[k];
            vhosts.list.push({
                path: vhostsCfg[k],
                domain: k
            });
        }
        return true;
    }
    return false;
}

process.on('SIGINT', function() {
  console.log('The service will be closed~!');
  process.exit(0);
});

exports.start = init;