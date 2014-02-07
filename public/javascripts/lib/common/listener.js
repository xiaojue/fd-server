/**
 * @fileoverview 广播组件
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/listener',function(require,exports,module){

	var $ = require('lib');
	var $events = require('lib/more/events');
	// Listener
	// -----------------
	// 用于全局广播的白名单控制机制

	var Listener = function(events){
		this._whiteList = {};
		this._receiver = new $events();
		if(Array.isArray(events)){
			events.forEach(this.define.bind(this));
		}
	};

	//事件添加，移除，激发的调用方法参考Events
	Listener.prototype = {
		constructor : Listener,
		//在白名单上定义一个事件名称
		define : function(eventName){
			this._whiteList[eventName] = true;
		},
		//取消白名单上的事件名称
		undefine : function(eventName){
			delete this._whiteList[eventName];
		},
		on : function(){
			this._receiver.on.apply(this._receiver, arguments);
		},
		off : function(){
			this._receiver.off.apply(this._receiver, arguments);
		},
		trigger : function(events){
			var rest = [].slice.call(arguments, 1);

			//按照Events.trigger的调用方式，第一个参数是用空格分隔的事件名称列表
			events = events.split(/\s+/);

			//遍历事件列表，依据白名单决定事件是否激发
			events.forEach(function(evtName){
				if(this._whiteList[evtName]){
					this._receiver.trigger.apply(this._receiver, [evtName].concat(rest));
				}
			}.bind(this));
		},
		//添加事件 - 兼容代码
		add : function(){
			this.on.apply(this, arguments);
		},
		//激发事件 - 兼容代码
		fire : function(){
			this.trigger.apply(this, arguments);
		},
		//移除事件 - 兼容代码
		remove : function(){
			this.off.apply(this, arguments);
		}
	};

	module.exports = Listener;

});
