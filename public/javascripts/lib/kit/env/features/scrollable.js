/**
 * @fileoverview 特性检测 - scrollable 浏览器是否支持内容区域滚动
 * @author Liangdong | liangdong2@staff.sina.com.cn
 * @example
 * var $support = require('more/browser');
 * assertEqual($browser.IE, true);
 * assertEqual($browser.MOZ, true);
 */

define('lib/kit/env/features/scrollable',function(require,exports,module){

	var $os = require('lib/kit/env/os');
	var $browser = require('lib/kit/env/browser');

	var feature;

	var testFeature = function(){
		var support = false;
		//除以下所列情况，其他均视为不支持内容区域滚动
		
		if($browser.MOBILE){
			if($browser.CHROME){
				//移动版 chrome 支持 overflow:scroll
				support = 'scroll';
			}else if(
				(/ucbrowser/i).test($browser.UA)
			){
				//UC浏览器不支持内部滚动
				support = false;
			}else{
				if($os.ios){
					if(parseFloat($os.version) >= 5){
						//IOS 5.0 以上支持 overflow-scrolling:touch
						support = 'touch';
					}
				}else if($os.android && !(/ucbrowser/).test($browser.UA)){
					if(parseFloat($os.version) >= 3){
						//android 3.0 以上支持 overflow:scroll
						support = 'scroll';
					}
				}
			}
		}else{
			//pc浏览器支持 overflow:scroll
			support = 'pc';
		}

		return support;
	};

	module.exports = function(){
		if(typeof(feature) === 'undefined'){
			feature = testFeature();
		}
		return feature;
	};

});
