var fs = require('fs');
var net = require('net');
var path = require('path');
var crypto = require('crypto');
var lodash = require('./lodash');

var portrange = 45032;
 
function getPort (cb) {
  var port = portrange;
  portrange += 1;
 
  var server = net.createServer();
  server.on('error', function (err) {
    getPort(cb);
  });
  server.listen(port, function (err) {
    server.once('close', function () {
      cb(port);
    });
    server.close();
  });
}

function mixOptions(defaults, options) {
	var mixData = {};
	for (var key in defaults) {
		if (options[key]) mixData[key] = options[key];
		else mixData[key] = defaults[key];
	}
	return mixData;
}

//递归创建目录 同步
function mkdirsSync(dirname, mode) {
	if (fs.existsSync(dirname)) {
		return true;
	} else {
		if (mkdirsSync(path.dirname(dirname), mode)) {
			fs.mkdirSync(dirname, mode);
			return true;
		}
	}
}

function fileToJson(filepath){
	if(fs.existsSync(filepath)){
		var str = fs.readFileSync(filepath);		
		return JSON.parse(str);
	}else{
		return null;
	}
}

function md5(str){
    var hash = crypto.createHash('md5');
    return hash.update(str+"").digest('hex');
}
//监听文件是否变动, callback(error, json), json为变动后的文件内容json对象
function watchFile(filepath, callback, time){
	if(fs.existsSync(filepath)){
		var reg = /(^\s*)|(\s*$)/g;
		var str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
		var fMd5 = md5(str);
		time = parseInt(time,10) || 30;

		fs.watchFile(filepath, {interval: time*1000}, function (curr, prev){
			if(curr.mtime > prev.mtime){
				var _str = fs.readFileSync(filepath, "utf-8").replace(reg, '');
				var _fMd5 = md5(_str);
				if(fMd5 !== _fMd5){
					fMd5 = _fMd5;
					callback(null, JSON.parse(_str));
				}
			}
		});
	}else{
		var err = filepath + ' 文件不存在';
		callback(err);
	}
}

exports.mixOptions = mixOptions;
exports.mkdirsSync = mkdirsSync;
exports.fileToJson = fileToJson;
exports.watchFile = watchFile;
exports.noop = function(){};
exports.getPort= getPort;
exports._ = lodash;
