/**
 * @fileoverview 基础工厂元件类
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/mvc/base',function(require,exports,module){
	var $ = require('lib');
	var $class = require('lib/more/class');
	var $events = require('lib/more/events');

	var Base = $class.create({
		Implements : [$events],
		//类的默认值，不要在实例中修改这个对象
		defaults : {},
		initialize : function(options){
			this.setOptions(options);
			this.build();
			this.setEvents('on');
		},
		setOptions : function(options){
			this.conf = this.conf || $.extend(true, {}, this.defaults);
			if(!$.isPlainObject(options)){
				options = {};
			}
			$.extend(true, this.conf, options);
		},
		//初始化，构建
		build : $.noop,
		setEvents : $.noop,
		//代理函数
		proxy : function(name){
			var that = this;
			var bound = this.bound ? this.bound : this.bound = {};
			name = name || 'proxy';
			if(!$.isFunction(bound[name])){
				bound[name] = function(){
					if($.isFunction(that[name])){
						return that[name].apply(that, arguments);
					}
				};
			}
			return bound[name];
		},
		destroy : function(){
			this.setEvents('off');
			this.off();
			this.bound = null;
		}
	});

	module.exports = Base;

});

