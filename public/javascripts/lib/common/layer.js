/**
 * @fileoverview 通用浮层配置模块
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/layer',function(require,exports,module){

	//加载基础对话框
	var $alert = require('mods/dialog/alert');
	var $confirm = require('mods/dialog/confirm');
	var $tip = require('mods/dialog/tip');
	var $loading = require('mods/dialog/loading');

	exports.alert = $alert;
	exports.confirm = $confirm;
	exports.loading = $loading;
	exports.tip = $tip;

});

