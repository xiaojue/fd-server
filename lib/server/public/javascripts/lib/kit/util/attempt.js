/**
 * @fileoverview 提供try catch 处理机制 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/util/attempt',function(require,exports,module){

	var $ = require('lib');

	//提供一个默认的try catch处理机制
	//param {Function} fn 要尝试处理的函数
	//param {Object} options 选项
	/* example:
	attempt(function(){
		//do somthing ...
	}, {
		name : 'test',
		bind : window,
		time : true,
		error : function(){},
		next : function(){}
	});
	*/
	module.exports = function(fn, options){
		var t1, t2, error = false, log = $.log;
		options = $.extend({
			name : '',			//标记日志名称
		//	bind : null,		//默认应该为undefined，所以注释本行
			time : false,		//是否输出计时日志
			success : $.noop,	//无错回调
			error : $.noop,		//发生错误的回调
			next : $.noop		//无论成功失败都要执行的回调
		}, options);

		try{
			t1 = Date.now();
			if(typeof(options.bind) === 'undefined'){
				fn();
			}else{
				fn.call(options.bind);
			}
			t2 = Date.now();
		}catch(e){
			error = true;
			log('[' + options.name + ']:', e.toString(), e);
			options.error(e);
		}finally{
			if(options.time){
				log('[' + options.name + ']:', t2 - t1 + 'ms');
			}
			if(!error){
				options.success();
			}
			options.next();
		}
	};

});

