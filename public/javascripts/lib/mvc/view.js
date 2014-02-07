/**
 * @fileoverview 基本视图
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/mvc/view',function(require,exports,module){
	var $ = require('lib');
	var $base = require('lib/mvc/base');
	var $delegate = require('lib/mvc/delegate');

	//获取视图的根节点
	var getRoot = function(){
		var conf = this.conf;
		var template = conf.template;
		var nodes = this.nodes;
		var root = nodes.root;
		if(!root){
			if(conf.node){
				root = $(conf.node);
			}
			if(!root || !root.length){
				if($.isArray(template)){
					template = template.join('');
				}
				root = $(template);
			}
			nodes.root = root;
		}
		return root;
	};

	var View = $base.extend({
		defaults : {
			node : '',
			template : '',
			events : {},
			role : {}
		},
		initialize : function(options){
			this.nodes = {};
			View.superclass.initialize.apply(this,arguments);
		},
		setEvents : function(action){
			this.delegate(action);
		},
		delegate : function(action, root, events, bind){
			action = action || 'on';
			root = root || this.role('root');
			events = events || this.conf.events;
			bind = bind || this;
			$delegate(action, root, events, bind);
		},
		//获取 / 设置角色元素的jquery对象
		//注意：获取到角色元素后，该jquery对象会缓存在视图对象中
		role : function(name, element){
			var nodes = this.nodes;
			var root = getRoot.call(this);
			var role = this.conf.role || {};
			if(!element){
				if(nodes[name]){
					element = nodes[name];
				}
				if(name === 'root'){
					element = root;
				}else if(!element || !element.length){
					if(role[name]){
						element = root.find(role[name]);
					}else{
						element = root.find('[data-role="' + name + '"]');
					}
					nodes[name] = element;
				}
			}else{
				nodes[name] = element = $(element);
			}
			return element;
		},
		//清除视图缓存的角色dom元素
		resetRoles : function(){
			var nodes = this.nodes;
			$.each(nodes, function(name){
				if(name !== 'root'){
					nodes[name] = null;
					delete nodes[name];
				}
			});
		},
		destroy : function(){
			View.superclass.destroy.apply(this,arguments);
			this.resetRoles();
			this.nodes = null;
		}
	});

	module.exports = View;

});

