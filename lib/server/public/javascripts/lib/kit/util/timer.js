/**
 * @fileoverview 用 requestAnimationFrame 包装定时器
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/util/timer',function(require,exports,module){

	var $ = require('lib');
	var $win = window;

	//取得对应的浏览器前缀
	var prefix = $.getPrefix().replace(/-/gi, '');

	//如果有对应名称的方法，直接返回该方法，否则返回带有对应浏览器前缀的方法
	var getPrefixMethod = function(name){
		var prefixName = name.charAt(0).toUpperCase() + name.substr(1);
		var method = $win[name] || $win[prefix + prefixName];
		if($.type(method) === 'function'){
			return method.bind($win);
		}else{
			return null;
		}
	};

	var requestAnimationFrame = getPrefixMethod('requestAnimationFrame');
	var cancelAnimationFrame = getPrefixMethod('cancelAnimationFrame') || $.noop;

	var Timer = {};

	if(requestAnimationFrame){
		var setTimer = function(fn, delay, type){
			var obj = {};
			var time = Date.now();
			delay = delay || 0;
			delay = Math.max(delay, 0);
			obj.step = function(){
				var now = Date.now();
				if(now - time > delay){
					fn();
					if(type === 'timeout'){
						clearTimer(obj);
					}else{
						time = now;
					}
				}
				obj.requestId = requestAnimationFrame(obj.step);
			};
			requestAnimationFrame(obj.step);
			return obj;
		};

		var clearTimer = function(obj){
			if(obj.requestId && $.type(obj.step) === 'function'){
				obj.step = $.noop;
				cancelAnimationFrame(obj.requestId);
				obj.requestId = 0;
			}
		};

		Timer.setInterval = function(fn, delay){
			return setTimer(fn, delay, 'interval');
		};

		Timer.setTimeout = function(fn, delay){
			return setTimer(fn, delay, 'timeout');
		};

		Timer.clearTimeout = clearTimer;
		Timer.clearInterval = clearTimer;
	}

	Timer.setInterval = Timer.setInterval || $win.setInterval.bind($win);
	Timer.clearInterval = Timer.clearInterval || $win.clearInterval.bind($win);
	Timer.setTimeout = Timer.setTimeout || $win.setTimeout.bind($win);
	Timer.clearTimeout = Timer.clearTimeout || $win.clearTimeout.bind($win);

	module.exports = Timer;

});


