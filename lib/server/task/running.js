var sheller = require('sheller');
var path = require('path');
var fs = require('fs');
var async = require("async");
var param = process.argv.slice(2);
var dir = param.shift();

function runTask(filePath, taskName, cb){
    sheller.loadTasks(filePath, true);
    sheller.execTask([taskName], cb);
}
if(dir && fs.existsSync(dir)){
    async.eachSeries(param, function (item, callback){
        var arr = item.split(":");
        if(arr && arr.length ==2){
            runTask(path.join(dir, arr[0]), arr[1], function (){
                callback();
            });
        }else{
            callback();
        }
    },function(err){
        setTimeout(function (){process.exit(0);},1000);
    });
}
