/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 操作系统服务
 */
var fs = require("fs");
var logger = require('./log/logger.js').getLogger("operate");
var sName = {
	"win32": "node-windows",
	"linux": "node-linux",
	"darwin": "node-mac"
} [process.platform];

function getScriptName(script){
	var matchName = script.match(/\w+\.js$/g);
	return matchName ? matchName[1] : 'unNameScriptService';
}

var sysService = require(sName).Service;
/**
*@description 获取一个系统服务对象，该方法会注册一个系统服务并返回该服务对象。
*/
function getService(options, cb) {
	var script = options.script;
	fs.exists(script, function(t) {
		if (t) {
			var name = options.name || getScriptName(script);
			var description = options.description || '';
			var svc = new sysService({
				name: name,
				description: description,
				script: script
			});
			//判断服务是否存在，存在就直接把svc对象返回，不存在时安装然后返回。
			if (svc.exists) {
				cb(null,svc);
			} else {
				svc.on("install", function(){
					cb(null,svc);	
				});
				svc.on("error", cb);
				svc.install();
			}
		}
	});
}

/**
*@description 移除一个已注册的系统服务
*/
function remove(options, cb) {
	var script = options.script;
	fs.exists(script, function(t) {
		if (t) {
			var name = options.name || getScriptName(script);
			var description = options.description || '';
			var svc = new sysService({
				name: name,
				description: description,
				script: script
			});
			svc.on("uninstall",cb);
			svc.on("error", cb);
			svc.uninstall();
		}
	});
}

exports.remove = remove;
exports.getService = getService;
