var path = require('path');
var fs = require('fs');
var utils = require('./utils.js');
var LOCALPATH = process.env.HOME || process.env.USERPROFILE;

//配置文件管理
var configFileName = "config.json";
var configPath;
function configManager(){
    this.dir = path.join(LOCALPATH, '.fd-server');
    this.init();
}

configManager.prototype = {
    constructor: configManager,
    init: function (){
        var self = this;
        var dpath = path.join(__dirname, "../", configFileName);
        configPath = path.join(self.dir, configFileName);
        if(!fs.existsSync(self.dir)){
            utils.mkdirsSync(self.dir);
        }
        if(!fs.existsSync(configPath) && fs.existsSync(dpath)){
            self.set(fs.readFileSync(dpath, 'utf-8'));
        }
    },
    //保存数据
    set: function (data, filename){
        var filePath = filename ? filePath = path.join(this.dir, filename) : configPath;
        var content = typeof data == "string" ? data : JSON.stringify(data, null, 4);
        
        fs.writeFileSync(filePath, content, 'utf-8');
    },
    //获取数据 json格式
    getJson: function (filename){
        var fileContent = this.getContent(filename);
        if(fileContent){
            return JSON.parse(fileContent);
        }else{
            return null;
        }
    },
    //获取数据 字符串
    getContent: function (filename){
        var filePath = filename ? filePath = path.join(this.dir, filename) : configPath;
        if(fs.existsSync(filePath)){
            return fs.readFileSync(filePath, 'utf-8');
        }else{
            return null;
        }
    },
    //获取路径
    getPath: function (filename){
        return filename ? path.join(this.dir, filename) : configPath;
    }
};

module.exports = new configManager();