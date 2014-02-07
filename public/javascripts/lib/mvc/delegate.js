/**
 * @fileoverview 事件对象绑定
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/mvc/delegate', function(require,exports,module) {

	//method delegate 将events中包含的键值对映射为代理的事件
	//param {Boolean} action 开/关代理 ['on', 'off']。
	//param {Element} root 设置代理的根节点，应该是一个jquery对象。
	//param {Object} events 事件键值对，格式可以为：
	//	{'selector event':'method'}
	//  {'event':'method'}
	//  {'selector event':'method1 method2'}
	//  {'event':'method1 method2'}
	//param {Object} bind 指定事件函数绑定的对象。
	module.exports = function(action, root, events, bind){
		var proxy, delegate;
		if(!root){return;}
		if(!bind || !$.isFunction(bind.proxy)){return;}

		proxy = bind.proxy();
		action = action === 'on' ? 'on' : 'off';
		delegate = action === 'on' ? 'delegate' : 'undelegate';
		events = $.extend({}, events);

		$.each(events, function(handle, method){
			var selector, event, fns = [];
			handle = handle.split(/\s+/);
			if($.type(method) === 'string'){
				fns = method.split(/\s+/).map(function(fname){
					return proxy(fname);
				});
			}else if($.isFunction(method)){
				fns = [method];
			}else{
				return;
			}
			event = handle.pop();
			if(handle.length >= 1){
				selector = handle.join(' ');
				if($.isFunction(root[delegate])){
					fns.forEach(function(fn){
						root[delegate](selector, event, fn);
					});
				}
			}else{
				if($.isFunction(root[action])){
					fns.forEach(function(fn){
						root[action](event, fn);
					});
				}
			}
		});

	};
});

