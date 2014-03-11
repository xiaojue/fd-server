/**
 * @fileoverview 公共广播频道
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/channel',function(require,exports,module){

	var $listener = require('lib/common/listener');
	module.exports = new $listener([
		//用户登录后会触发
		'login',
		//注销，用户注销后会触发
		'logout',
		//登录状态发生变更，包括登录，注销，切换用户
		'loginStateChange',
		//需要登录时触发
		'needLogin',
		//需要注册时触发
		'needRegister',
		//页面被删除后触发
		'pageDeleted',
		//页面组件有安装(attach)或者拆除(detach)时触发
		'pageletsUpdate',
		//页面内容与状态更新时触发
		'contentUpdate',
		//地址发生了变更后触发
		'locationChange',
		//需要变更地址时触发
		'changeLocation'
	]);
});
