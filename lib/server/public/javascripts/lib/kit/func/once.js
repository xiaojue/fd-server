/**
 * @fileoverview 包装为仅触发一次的函数
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {Function} fn 要延迟触发的函数
 * @param {Object} bind 函数的this指向
 */

define('lib/kit/func/once',function(require,exports,module){

	module.exports = function(fn, bind){
		return function(){
			bind = bind || this;
			if(fn){
				fn.apply(bind, arguments);
				fn = bind = null;
			}
		};
	};
});

