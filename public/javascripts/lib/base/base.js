/**
 * @fileoverview 业务对象基类
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	var $base = require('lib/base/base');
	var obj = new $base();

	//下面的change事件仅在值发生变更时触发
	obj.set('prop', 'value');
	//trigger : 'change:prop'
	//trigger : 'change'

	obj.set('obj.prop', 'value');
	//trigger : 'change:obj.prop'
	//trigger : 'change:obj'
	//trigger : 'change'

	obj.set( {obj:{ prop:'value' }} );
	//trigger : 'change:obj.prop'
	//trigger : 'change:obj'
	//trigger : 'change'

	obj.get('prop');
	obj.get('obj.prop');
 */

define('lib/base/base',function(require,exports,module){
	var $ = require('lib');
	var $class = require('lib/more/class');
	var $events = require('lib/more/events');

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

	//一边混合对象，一边检查变更
	//param {Object} original 待混合的对象
	//param {Object} object 待混合的对象
	//param {String} pth 对象所在的访问路径
	//param {Array} mergeDiffs 混合对象时，产生属性差异的路径集合
	var merge = function(original, object, pth, mergeDiffs) {
		var k;
		var chg = false;	//标记是否发生过值的变更
		var diff = false;	//标记每轮属性检查中，是否有值的变更
		for (k in object) {
			diff = false;

			//仅对纯 object 递归
			if ($.isPlainObject(object[k])) {
				if ($.type(original[k]) !== 'object') {
					original[k] = {};
					diff = true;
					chg = true;
				}
				diff = merge(original[k], object[k], pth.concat([k]), mergeDiffs);
				if (chg === false) {
					chg = diff;
				}
			} else {
				if (original[k] !== object[k]) {
					diff = true;
					chg = true;
				}
				original[k] = object[k];
			}

			//每轮属性检查都要判断是否有属性变更
			if (diff) {
				mergeDiffs.push(pth.concat([k]).join('.'));
			}
		}
		return chg;
	};

    //业务对象的基类
	var Base = $class.create({
		Implements : [$events],
		//这里用来配置基础选项
		//这个对象被绑定在原型上，不要修改这个对象
		//这是为了方便实例化之后再次调用setOptions方法
		//在继承中，这个选项会被完全覆盖，属性不会混合
		options : {},
		//初始化
		initialize : function(options){
			this.objs = {};		//存放组件相关的对象实例
			this.nodes = {};	//存放组件相关的DOM元素
			this.data = {};		//存放组件相关数据
			this.bound = {};	//存放组件需要绑定的事件函数

			this.setOptions(options);	//设置选项
			this.prepare();				//解析DOM之前需要做的准备工作
			this.parseDom();			//解析DOM
			this.build();				//构造组件
			this.setBound();			//创建可绑定的事件函数
			this.detach();				//先确保组件为拆卸状态
			this.attach();				//安装组件
		},
		//设置选项
		//选项的属性会被复制到this.data
		setOptions : function(options){
			this.conf = $.extend(true, {}, this.options, options);
			this.set('conf', $.extend(true, {}, this.conf));
		},
		//解析DOM之前的准备
		prepare : $.noop,
		//解析DOM
		parseDom : $.noop,
		//构建模块
		build : $.noop,
		//把要绑定的事件函数添加到this.bound对象上
		setBound : function(){
			this.bound = {};
		},
		//向this.bound对象添加一个本对象的同名函数，作为要绑定的事件
		getBound : function(name){
			var that = this;
			var bound = this.bound;
			name = name || 'getBound';
			if($.type(bound[name]) !== 'function'){
				bound[name] = function(){
					if($.type(that[name]) === 'function'){
						return that[name].apply(that, arguments);
					}
				};
			}
			return bound[name];
		},
		//设置DOM事件
		setDomEvents : $.noop,
		//设置自定义事件
		setCustEvents : $.noop,
		//设置广播事件
		setListener : $.noop,
		//设置属性
		set : function(key, val){
			var that = this;
			var keys, obj, prop;
			var changed = false;
			var path = [];
			var differences = [];
			var mergeDiffs = [];
			if (this.data) {
				//考虑键值为'prop.inner'的情况
				if ($.type(key) === 'string') {
					obj = this.data;
					keys = key.split(/\./);
					while (keys.length) {
						prop = keys.shift();
						path.push(prop);
						differences.push(path.join('.'));
						if (keys.length && $.type(obj[prop]) !== 'object') {
							obj[prop] = keys.length ? {} : val;
							changed = true;
						}
						if (keys.length) {
							obj = obj[prop];
						} else {
							if ($.isPlainObject(val)) {
								if ($.type(obj[prop]) !== 'object') {
									obj[prop] = {};
									changed = true;
								}
								merge(obj[prop], val, path, mergeDiffs);
							} else {
								if (obj[prop] !== val) {
									changed = true;
								}
								obj[prop] = val;
							}
						}
					}
				} else if ($.isPlainObject(key)) {
					merge(this.data, key, path, mergeDiffs);
				}
				if (changed || mergeDiffs.length) {
					mergeDiffs.concat(differences.reverse()).forEach(function(t) {
						that.trigger('change:' + t);
					});
					that.trigger('change');
				}
			}
		},
		//获取属性
		get : function(key){
			var keys, val;
			if($.type(key) !== 'string'){return;}
			if(this.data){
				val = this.data;
				keys = key.split(/\./);
				while(keys.length){
					if(val){
						val = val[keys.shift()];
					}else{
						break;
					}
				}
				if($.type(val) === 'object'){
					return $.extend(true, {}, val);
				}else if($.type(val) === 'array'){
					return $.extend(true, [], val);
				}else{
					return val;
				}
			}
		},
		//安装组件
		attach : function(){
			if(this.get('attached')){return;}

			this.setDomEvents('add');		//绑定DOM事件
			this.setCustEvents('add');		//绑定自定义事件
			this.setListener('add');		//绑定广播
			traverse.call(this, 'attach');	//遍历子对象的attach方法

			this.set('attached', true);		//标记组建状态为已加载
			this.trigger('attach');			//绑定好事件后，触发attach事件
		},
		//拆卸组件
		detach : function(){
			if(!this.get('attached')){return;}

			this.set('attached', false);	//标记组件状态为已拆卸
			this.trigger('detach');			//在解绑事件前，触发detach事件

			traverse.call(this, 'detach');	//遍历子对象的detach方法
			this.setListener('remove');		//解除广播
			this.setCustEvents('remove');	//解除自定义事件
			this.setDomEvents('remove');	//解除DOM事件
		},
		//销毁组件
		destroy : function(){
			this.trigger('destroy');
			this.detach();
			this.off();
			$.each(this.nodes, function(key, node){
				$(node).remove();
			});
			traverse.call(this, 'destroy');
			this.conf = null;
			this.objs = null;
			this.nodes = null;
			this.data = null;
			this.bound = null;
		}
	});

	module.exports = Base;

});

