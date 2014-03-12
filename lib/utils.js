var fs = require('fs');
var path = require('path');
var log = require('./log/logger');
var logger = log.getLogger('operate');

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
		logger.error(filepath + ' 文件不存在');
		return null;
	}	
}

exports.mixOptions = mixOptions;
exports.mkdirsSync = mkdirsSync;
exports.fileToJson = fileToJson;
