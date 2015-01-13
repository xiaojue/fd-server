var Path = require('path');
var fs = require('fs');
var utils = require('./utils.js');
var events = require('events');
var util = require('util');
var fileSizeWatcher = require('file-size-watcher');
var filesize = require('file-size');
var logFile = Path.resolve(__dirname, '../fdserver.log');
var rmdir = require('rimraf');
var LOCALPATH = process.env.HOME || process.env.USERPROFILE;
var diff = require('deep-diff');

//配置文件管理
var configFileName = "config.json";
var configPath;

function configManager() {
  this.dir = Path.join(LOCALPATH, '.fd-server');
  this.init();
  events.EventEmitter.call(this);
}

util.inherits(configManager,events.EventEmitter);

/*
var content = {
  config: {
    "vhost": {},
    "proxy": [],
    "proxyGroup": [],
    "port": 8989
  }
};
*/

utils.extend(configManager.prototype,{
  init: function() {
    var self = this;
    var dpath = Path.join(__dirname, "../", configFileName);
    configPath = Path.join(self.dir, configFileName);
    if (!fs.existsSync(self.dir)) {
      utils.mkdirsSync(self.dir);
    }
    if (!fs.existsSync(configPath)) {
      if (fs.existsSync(dpath)) {
        self.set(fs.readFileSync(dpath, 'utf-8'));
      } else {
        self.set({});
        logger.info("auto product config.json success.....");
      }
    }
    this.oldjson = self.getJson();
    utils.watchFile(configPath, function(err, json) {
      if (err){
        self.emit('error',err);
      }else {
        var differences = diff(json,self.oldjson);
        self.emit('change',json,differences);
        self.oldjson = json;
      }
    },
    3);
    //日志定期储存 并处理
    fileSizeWatcher.watch(logFile).on('sizeChange', function callback(newSize, oldSize) {
      var sizes = filesize(newSize).to('MB', true);
      if (sizes > 2) {
        var data = fs.readFileSync(logFile, 'utf-8');
        //备份文件
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir);
        }
        var backFiles = Path.resolve(__dirname, '../backup', 'backFiles' + new Date().getTime() + '.txt');
        fs.writeFileSync(backFiles, data);
        var dirsize = 0;
        fs.readdirSync(backupDir).forEach(function(file, index) {
          var curPath = Path.resolve(backupDir, file);
          fs.stat(curPath, function(err, stats) {
            dirsize += filesize(stats.size).to('MB', true);
            if (dirsize > 20) {
              rmdir(backupDir, function(error) {});
            }
          });
        });
        var dataArr = data.split(/\n/g);
        var r = dataArr.slice( - 200).join("\n");
        fs.writeFileSync(logFile, r);
      }
    });
  },
  //保存数据
  set: function(data, filename) {
    var filePath = filename ? filePath = Path.join(this.dir, filename) : configPath;
    var content = typeof data == "string" ? data: JSON.stringify(data, null, 4);

    fs.writeFileSync(filePath, content, 'utf-8');
  },
  //获取数据 json格式
  getJson: function(filename) {
    var fileContent = this.getContent(filename);
    if (fileContent) {
      return JSON.parse(fileContent);
    } else {
      return null;
    }
  },
  //获取数据 字符串
  getContent: function(filename) {
    var filePath = filename ? filePath = Path.join(this.dir, filename) : configPath;
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    } else {
      return null;
    }
  },
  //获取路径
  getPath: function(filename) {
    return filename ? Path.join(this.dir, filename) : configPath;
  }
});

module.exports = new configManager();
