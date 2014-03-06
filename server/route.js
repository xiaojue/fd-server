/**
*@description 路由服务
*@updateTime 2014-02-20/28 修改路由服务启用成功后再做hosts绑定
*/
var logger = require('../lib/log/logger.js').getLogger("vhosts");
var bouncy = require('bouncy');
var fs = require("fs");
var hosts = require("./hosts");

var server = null;//当前开启的路由服务对象
var routeList = {};//路由域名端口列表

/**
*@description 开启/重启路由服务
*@param list 路由域名端口列表
*/
function start(list){
    //指定路由列表不存在或为空对象，直接关闭退出。
    if(typeof list !== "object" || JSON.stringify(list) === "{}"){
        close();
        return;
    }
    //判断路由列表是否发生变化
    if(!isChange(list)){
        return;
    }
    //是否已开启过服务，有则关闭重启
    if(server){
        logger.info("重启路由中...");
        server.close(); 
    }
    
    //更新绑定hosts
    var listStr = JSON.stringify(list);
    //先移除不再需要绑定的hosts
    for(var dm in routeList){
        if(listStr.indexOf(dm) === -1){
            hosts.remove(dm);
        }
    }
    
    //启动路由服务，成功时再去添加新增绑定hosts
    route(list, function (err){
        if(err){
            logger.error(err);
        }else{
            //添加新增的绑定hosts
            logger.debug("route: " + JSON.stringify(list));
            for(var dm in list){
                if(!routeList[dm]){
                    hosts.set(dm);
                }
            }
            
            routeList = list;
        }
    });
    
}

//开启路由
function route(list, cb){
    server = bouncy(function (req, res, bounce){
        var port = list[req.headers.host];
        // logger.debug("route: "+req.headers.host);
        //res.statusCode = 200;
	//res.end('port is '+port);
	bounce(port);
	/*
        if(port){
            // logger.debug("route: "+port);
            //bounce(3003);
            //bounce(port);
            res.statusCode = 200;
	    res.end('port');
        else{
            res.statusCode = 404;
            res.end("no such host");
        }
	*/
    });
    server.on("error", function (err){
        cb(err);
    });
    server.on("listening", function (){
        logger.info("路由已启用！");
        cb();
    });
    server.listen(80);
}

/**
*@description 判断路由列表是否发生变化
*@param list 当前需要启用的路由列表
*@return true/false
*/
function isChange(list){
    var n1 = (JSON.stringify(list).match(/:/g) || []).length;//list个数
    var n2 = (JSON.stringify(routeList).match(/:/g) || []).length;//routeList个数
    
    //属性个数不相同，返回true
    if(n1 !== n2){
        return true;
    }
    for(var dm1 in routeList){
        var t = true;
        t:for(var dm2 in list){
            if(dm1 == dm2 && routeList[dm1] == list[dm2]){
                t = false;
                break t;
            }
        }
        
        if(t){
            return true;
        }
    }
    return false;
}

//添加指定的domain指向
function add(port, domain){
    var _port = routeList[domain];
    if(_port && _port == port){
        return;
    }
    routeList[domain] = port;
    start(routeList);
}

//移除指定的domain指向
function remove(domain){
    if(routeList[domain]){
        delete routeList[domain];
        start(routeList);
    }
}

//关闭路由服务
function close(callback){
    callback = callback || function(){};
    if(server){
        server.close(callback);
    }
    clearHosts();
    routeList = {};
}

//清除所有路由服务绑定的hosts
function clearHosts(){
    for(var k in routeList){
        hosts.remove(k);
    }
}

exports.start = start;
exports.add = add;
exports.remove = remove;
exports.exit = close;
