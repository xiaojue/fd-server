/**
 * @fileoverview 包装为延迟触发的函数
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
	$('#input').keydown($delay(function(){
		this.length = $('#input').val().length;
	}, 200, comp));
 */
define('lib/kit/func/delay',function(require,exports,module){

	module.exports = function(fn, delay, bind){
		var timer = null;
		return function(){
			bind = bind || this;
			if(timer)clearTimeout(timer);
			var args = arguments;
			timer = setTimeout(function(){
				fn.apply(bind, args);
			}, delay);
		};
	};
});

