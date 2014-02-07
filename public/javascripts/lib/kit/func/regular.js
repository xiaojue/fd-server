/**
 * @fileoverview 包装为规律触发的函数，用于降低密集事件的处理频率
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {Function} fn 要延迟触发的函数
 * @param {Number} delay 延迟时间[ms]
 * @param {Object} bind 函数的this指向
 * @example
	var comp = {
		countWords : function(){
			console.debug(this.length);
		}
	};
	$('#input').keydown($regular(function(){
		this.length = $('#input').val().length;
	}, 200, comp));
 */

define('lib/kit/func/regular',function(require,exports,module){

	module.exports = function(fn, delay, bind){
		var enable = true,
			args = [],
			timer = null;
		return function(){
			bind = bind || this;
			enable = true;
			args = arguments;
			if(!timer){
				timer = setInterval(function(){
					fn.apply(bind, args);
					if(!enable){
						clearInterval(timer);
						timer = null;
					}
					enable = false;
				}, delay);
			}
		};
	};
});
