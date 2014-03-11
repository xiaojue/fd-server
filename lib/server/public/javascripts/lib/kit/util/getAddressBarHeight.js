/**
 * @fileoverview 获取导航条高度
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/util/getAddressBarHeight',function(require,exports,module){

	var $ = require('lib');
	var $browser = require('lib/kit/env/browser');
	var $os = require('lib/kit/env/os');

	//由于ios,iphone横屏高度太小，针对这两类设备输出导航条高度
	module.exports = function(){
		var height = 0;
		if($browser.MOBILE && ( $browser.ITOUCH || $browser.IPHONE ) && $browser.SAFARI){
			if($os.ios && $os.version > 4 && $os.version < 7){
				height = 60;
			}
		}
		return height;
	};

});

