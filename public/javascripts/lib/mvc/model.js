/**
 * @fileoverview 基本模型
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/mvc/model',function(require,exports,module){
	var $ = require('lib');
	var $base = require('lib/mvc/base');
	var $delegate = require('lib/mvc/delegate');

	//获取隐形键名
	var getName = function(key){
		return '__' + key + '__';
	};

	//为类的data对象设置可监控属性
	//param {String} key 属性名称
	//param {Mixed} value 属性值
	var setAttr = function(key, value){
		if($.type(key)!=='string'){return;}
		var that = this;
		var data = this.data || {};
		var name = getName(key);
		if(!data.hasOwnProperty(name)){
			Object.defineProperty(data, name, {
				writable:true,
				enumerable:false,
				configurable:true
			});
			Object.defineProperty(data, key, {
				set : function(val){
					var prevValue = this[key];
					if(val !== prevValue){
						this[name] = val;
						that.changed = true;
						that.trigger('change:' + key, prevValue);
					}
				},
				get : function(){
					return this[name];
				},
				// A property cannot both have accessors and be writable or have a value
				enumerable:true,
				configurable:true
			});
			this.changed = true;
		}
		data[key] = value;
	};

	//为类的data对象设置可计算属性
	//param {String} key 属性名称
	//param {Function} fn 属性计算函数
	var setComputedAttr = function(key, fn){
		if($.type(key)!=='string'){return;}
		var that = this;
		var data = this.data || {};
		var name = getName(key);
		setAttr.call(this, key);
		Object.defineProperty(data, key, {
			get : function(){
				return fn.call(that, this[name]);
			}
		});
	};

	//为类的data对象清除属性
	//param {String} key 属性名称
	var removeAttr = function(key){
		var name = getName(key);
		delete this.data[name];
		return delete this.data[key];
	};

	var Model = $base.extend({
		defaults : {},
		events : {},
		initialize : function(options){
			this.data = {};
			this.changed = false;
			Model.superclass.initialize.apply(this,arguments);
		},
		//配置选项与模型
		setOptions : function(options){
			Model.superclass.setOptions.apply(this,arguments);
			this.set(this.conf);
		},
		//model的事件应当仅用于自身属性的关联运算
		setEvents : function(action){
			this.delegate(action);
		},
		//代理自身事件
		delegate : function(action, root, events, bind){
			action = action || 'on';
			root = root || this;
			events = events || this.events;
			bind = bind || this;
			$delegate(action, root, events, bind);
		},
		//设置模型的属性
		//将会触发change事件
		//会触发针对每个属性的 change:propname 事件
		set : function(key, val){
			if($.isPlainObject(key)){
				$.each(key, setAttr.bind(this));
			}else if($.type(key) === 'string'){
				setAttr.call(this, key, val);
			}
			if(this.changed){
				this.trigger('change');
				this.changed = false;
			}
		},
		//获取模型对应属性的值的拷贝
		//如果不传参数，则直接获取整个模型数据
		get : function(key){
			var value;
			if($.type(key) === 'string'){
				value = this.data[key];
				if($.isPlainObject(value)){
					return $.extend(true, {}, value);
				}else if($.isArray(value)){
					return $.extend(true, [], value);
				}else{
					return value;
				}
			}
			if(typeof key === 'undefined'){
				return $.extend(true, {}, this.data);
			}
		},
		//设置自动计算属性
		//注意：自动计算属性不会因为自动计算而触发 change 事件
		setComputed : function(key, fn){
			if($.type(key) === 'object'){
				$.each(key, setComputedAttr.bind(this));
			}else if($.type(key) === 'string' && $.isFunction(fn)){
				setComputedAttr.call(this, key, fn);
			}
		},
		//获取模型上设置的所有键名
		keys : function(){
			return Object.keys(this.data);
		},
		//删除模型上的一个键
		remove : function(key){
			removeAttr.call(this, key);
			this.trigger('change:' + key);
			this.trigger('change');
		},
		//清除模型中所有数据
		clear : function(){
			Object.keys(this.data).forEach(this.remove, this);
		},
		destroy : function(){
			this.changed = false;
			Model.superclass.destroy.apply(this,arguments);
			this.clear();
			this.data = null;
		}
	});

	module.exports = Model;

});

