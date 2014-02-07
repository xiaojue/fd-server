/**
 * @fileoverview touch 环境检测
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/env/touch',function(require,exports,module){

	var touchEnable = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

	module.exports = {
		//是否支持touch
		enable : touchEnable
	};

});


