var fs = require('fs');
var path = require('path');
var sheller = require('sheller');
var log4js = require("log4js");
var cp = require('child_process');
var socket = require('../socket.js');
var configManager = require('../../configManager');

function Task(){
    this.logger = console;
    this.init();
}

Task.prototype = {
    constructor: Task,
    init: function (){
        
    },
    readTask: function (){
        var self = this;
        var result = null;
        var dir = self.getDir();
        
        if(dir && fs.existsSync(dir)){
            var arr = fs.readdirSync(dir)||[];
            arr.forEach(function (item){
                if(/\.js$/.test(item)){
                    var file = path.join(dir,item);
                    var taskObj = self._getTaskInfo(file);
                    if(taskObj){
                        !result ? result = {} :'';
                        result[item] = taskObj;
                    }
                }
            });
        }
        return result;
    },
    runTasks: function (list, key){
        var self = this;
        var dir = self.getDir();
        var logger = getLogger(dir);
        var args = ['running.js'];
        args.push(dir);
        args = args.concat(list);
        var run = cp.spawn('node',args, {cwd:__dirname});
        var log = function (msg){
            if(msg.trim()){
                logger.info(msg.trim());
                key ? socket.send(msg, key) : '';
            }
        };
        run.stdout.on('data', function (data) {
            log(data+'');
        });

        run.stderr.on('data', function (data) {
            log(data+'');
        });
        
        run.on("error", function (err){
            logger.warn(err);
            key ? socket.send(err, key) : '';
        });
        run.on("close", function (code){
            log("@end");
        });
    },
    _getTaskInfo: function(file){
        var result = null;
        try{
            sheller.loadTasks(file, true);
            result = [];
            for(var k in sheller.tasks){
                result.push(k);
            }
        }catch(e){
            console.log(file + ": " + e.message);
        }
        return result;
    },
    setDir: function (dir){
        if(dir && fs.existsSync(dir)){
            var data = configManager.getJson();
            data.taskDir = dir;
            configManager.set(data);
            return true;
        }
        return false;
    },
    getDir: function (){
        var data = configManager.getJson();
        if(data && data.taskDir){
            return data.taskDir;
        }
        return null;
    }
};

function getLogger(dir){
    log4js.loadAppender('file');
    log4js.appenders['TASK'] = [];
    var appender = log4js.appenders.file(dir + "/tast.log");
    if(log4js.hasLogger("TASK")){
        log4js.getLogger('TASK').removeAllListeners();
    }
    log4js.addAppender(appender,'TASK');
    return log4js.getLogger('TASK');
}

module.exports = new Task();