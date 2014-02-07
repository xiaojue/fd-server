/**
 * @fileoverview 构建一个Ready事件管理组件
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	var prop = '';
	var obj = $makeReady({
		condition : function(){
			return !!prop;
		},
		ready : function(callback){
			setTimeout(function(){
				prop = 'ready';
				callback();
			});
		}
	});
	obj.exec(function(){
		console.debug(prop);
	});
	obj.exec(function(){
		console.debug(prop);
	});
 */

define('lib/kit/util/makeReady',function(require,exports,module){

	var $ = require('lib');

	//构建一个缓存队列，在回调完成前收集需要执行的任务
	module.exports = function(options){
		var conf = $.extend({
			condition : $.noop,	//判断什么条件下直接运行任务
			ready : $.noop		//回调任务，第一个参数必须为回调函数
		}, options);

		var cache;

		return {
			reset : function(){
				if(cache){
					cache.length = 0;
					cache = null;
				}
			},
			exec : function(fn){
				if($.type(fn) === 'function'){
					if(conf.condition()){
						fn();
					}else{
						if(!cache){
							cache = [];
							conf.ready(function(){
								while($.type(cache)==='array' && cache.length > 0){
									cache.shift()();
								}
							});
						}
						cache.push(fn);
					}
				}
			},
			destroy : function(){
				this.reset();
			}
		};
	};

});

