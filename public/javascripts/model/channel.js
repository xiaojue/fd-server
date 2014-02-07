/**
 * @fileoverview 公共广播频道
 * @authors xiaoyue3 <xiaoyue3@staff.sina.com.cn>
 */
define('model/channel',function(require,exports,module){

	var $listener = require('lib/common/listener');
	module.exports = new $listener([
		//点击保存事件的时候触发
		'saveRule',
		'updateGroupList'
	]);
});
