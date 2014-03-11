/**
 * @fileoverview 基本控制器
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/mvc/controller',function(require,exports,module){
	var $ = require('lib');
	var $base = require('lib/mvc/base');
	var $delegate = require('lib/mvc/delegate');

	//遍历从属实例的方法
	//{String} name 要调用的子对象方法名称
	var traverse = function(name){
		if(this.objs){
			$.each(this.objs, function(k, o){
				if( o && $.isFunction(o[name])){
					o[name]();
				}
			});
		}
	};

	var Controller = $base.extend({
		defaults : {
			node : null,
			events : {}
		},
		initialize : function(options){
			this.objs = {};
			this.setOptions(options);
			this.root = $(this.conf.node);
			this.build();
			this.attach();
		},
		setEvents : function(action){
			this.delegate(action);
		},
		delegate : function(action, root, events, bind){
			action = action || 'on';
			root = root || this.root;
			events = events || this.conf.events;
			bind = bind || this;
			$delegate(action, root, events, bind);
		},
		attach : function(){
			if(this.attached){return;}
			this.setEvents('on');
			traverse.call(this, 'attach');
			this.trigger('attach');
			this.attached = true;
		},
		detach : function(){
			if(!this.attached){return;}
			this.attached = false;
			this.trigger('detach');
			traverse.call(this, 'detach');
			this.setEvents('off');
		},
		destroy : function(){
			traverse.call(this, 'destroy');
			this.detach();
			this.delegate('off');
			this.off();
			this.objs = null;
			this.bound = null;
		}
	});

	module.exports = Controller;

});

