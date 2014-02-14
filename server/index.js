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
    vhosts.process = vhosts.process || child_process.fork(vhosts.module);
    vhosts.process.send({
        method: "update",
        options: [vhosts.list]
    });
}

function parseData(data){
    if(data){
        var vhostsCfg = data.vhosts;
        for(var i = 0; i < vhostsCfg.length; i++){
            var item = vhostsCfg[i];
            vhosts.list.push({
                path: item.path,
                port: item.port,
                ext: item.ext,
                domain: item.domain
            });
        }
        return true;
    }
    return false;
}

exports.start = init;