var fs = require('fs');
var path = require('path');
var sheller = require('sheller');
var cp = require('child_process');
var socket = require('../socket.js');
var utils = require('../../utils.js');

var cfgPath = path.join(__dirname, '../../../config.json');

function Task(){
    
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
        var args = ['running.js'];
        args.push(self.getDir());
        args = args.concat(list);
        var run = cp.spawn('node',args, {cwd:__dirname});
        run.stdout.on('data', function (data) {
            key ? socket.send(data, key) : console.log(data);
        });

        run.stderr.on('data', function (data) {
            key ? socket.send(data, key) : console.log(data);
        });
        
        run.on("error", function (err){
            key ? socket.send(err, key) : console.log(err);
        });
        run.on("close", function (code){
            key ? socket.send("@end", key) : console.log("@end", key);
        });
    },
    _getTaskInfo: function(file){
        var result = null;
        try{
            sheller.tasks = {};
            sheller.options = {};
            sheller.loadTasks(file);
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
            var data = utils.fileToJson(cfgPath)||{};
            data.taskDir = dir;
            fs.writeFileSync(cfgPath, JSON.stringify(data, null, 4), 'utf-8');
            return true;
        }
        return false;
    },
    getDir: function (){
        var data = utils.fileToJson(cfgPath);
        if(data && data.taskDir){
            return data.taskDir;
        }
        return null;
    },
};

module.exports = new Task();