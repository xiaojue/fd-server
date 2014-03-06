/*
 * GET log page.
 */
var logger = require('../lib/log/logger.js').getLogger("uipage");
var fs = require("fs");
var path = require("path");
var url = require("url");

exports.show = function(req, res){
	logger.info("showlog请求: " + req.url);
    var gdata = url.parse(req.url,true).query;
    var op = gdata.op; //操作类型, 默认查看
    
    getConf(function (err, conf){
        if(err){
            logger.error(err);
            res.render("showlog", {title: 'fd-server log', content: err});
            return;
        }
        
        if(op === "clear"){
            //清空日志
            logger.info("clear: 尚未处理......");
            res.render("showlog", {title: 'fd-server log', content: "clear 方法尚未添加实现......"});
        }else{
            var c = gdata.c || "all";
            var len = gdata.len || 100;
            
            rendLog(conf[c], len, function (err, data){
                err ? logger.error(err) : logger.debug("show log -" + data.length);
                res.render("showlog", {title: 'fd-server log', content: err||data});
            });
        }        
    });
    
};

function rendLog(file, len, cb){
    fs.readFile(file, 'utf-8', function (err, data){
        if(err){
            cb(err);
        }else{
            var dataArr = data.split(/\n/g);
            var r = dataArr.slice(-len).join("\n");
            
            cb(null, r);
        }
    });
}

function getConf(cb){
    var logConfPath = path.join(__dirname, "../lib/log/_conf.json");
    var cb = cb || function (){};
    
    fs.readFile(logConfPath, 'utf-8', function (err, data){
        if(err){
            logger.error(err);
            cb(err);
        }else{
            var result = {}, obj, appenders, item, i = 0;
            try{
                obj = JSON.parse(data);
                appenders = obj.appenders;
                for(; i < appenders.length; i++){
                    item = appenders[i];
                    if(item.type === "file"){
                        var category = item.category instanceof Array ? item.category[0] : item.category;
                        result[category] = item.filename;
                    }
                }
                cb(null, result);
            }catch(e){
                logger.error(e);
                cb(e);
            }
        }
    });
}
