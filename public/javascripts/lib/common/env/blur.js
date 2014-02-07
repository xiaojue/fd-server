/**
 * @fileoverview 解决点击空白处时，textarea与input焦点无法消失的问题
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/env/blur',function(require,exports,module){

	var $ = require('lib');

	var lastBlur = false;

	var checkTouchStart = function(evt){
		var el = $(evt.target);

		//document.activeElement 是获取了焦点的元素
		var tagName = document.activeElement.tagName.toLowerCase();
		if(!el.is('input') && !el.is('textarea')){
			if(tagName === 'input' || tagName === 'textarea'){
				lastBlur = true;
				$('input, textarea').blur();
			}
		}
	};

	var checkTouchEnd = function(evt){
		var el = $(evt.target);
		if(lastBlur){
			evt.preventDefault();
			lastBlur = false;
		}
	};

	$(document).bind('touchstart', checkTouchStart);
	$(document).bind('touchend', checkTouchEnd);

});
