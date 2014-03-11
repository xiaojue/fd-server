/**
 * @fileoverview 基本组件基类
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/base/module',function(require,exports,module){

	var $ = require('lib');
	var $base = require('lib/base/base');

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

	//基本组件基类
	//提供组件的DOM查找接口
	var Module = $base.extend({
		options : {
			//dom根节点，如'#pl-home'
			node : '',
			//组件DOM模板
			template : '',
			//缓存角色元素
			cacheRole : false,
			//角色映射表
			roles : {}
		},
		parseDom : function(){
			this.createRoot();
		},
		//创建模块的根节点
		createRoot : function(){
			var conf = this.conf;
			var nodes = this.nodes;

			//无论有没有conf.node
			//至少要创建一个jquery对象供组件使用
			if(!nodes.root){
				//如果根节点尚不存在，创建该根节点
				if(conf.node){
					nodes.root = $(conf.node);
				}else{
					nodes.root = $();
				}
			}

			//如果已有nodes.root对象，但页面DOM不存在
			//此时只要存在模板字符串，就从模板创建一个
			if(!nodes.root.length){
				if(conf.template && $.type(conf.template) === 'string'){
					nodes.root = $(conf.template);
				}
			}

			//在业务代码中具体实现组件插入布局的工作
			return nodes.root;
		},
		//获取布局模块的根节点
		getRoot : function(){
			var conf = this.conf;
			var nodes = this.nodes;
			if(!nodes.root){
				//这里不要判断 nodes.root.length
				//否则会造成 resetDom 导致的死循环
				this.createRoot();
				this.resetDom();
			}
			if(!nodes.root.length){
				nodes.root = $(conf.node);
			}
			return nodes.root;
		},
		//重置DOM事件, 重新绑定dom事件
		resetDom : function(){
			this.setDomEvents('remove');
			this.setDomEvents('add');
			this.trigger('resetDom');
		},
		//重置DOM角色列表
		//当组件根节点HTML被更新后，应当调用这个函数
		//避免之前jquery缓存了DOM对象
		resetRoles : function(){
			var nodes = this.nodes;
			Object.keys(nodes).forEach(function(key){
				var el = nodes[key];
				if(key !== 'root'){
					if(el && $.type(el.remove) === 'function'){
						el.remove();
					}
				}
				el = null;
				nodes[key] = null;
				delete nodes[key];
			});
			traverse.call(this, 'resetRoles');
			this.trigger('resetRoles');
			this.resetDom();
		},
		//获取模块角色节点，提供DOM缓存机制
		//如果不存在根节点就创建之
		role : function(roleName){
			var conf = this.conf;
			var nodes = this.nodes;
			var elRole = null;
			var roles = conf.roles;
			var selector = '';
			if(nodes[roleName] && nodes[roleName].length){
				//如果是已存在的DOM，直接返回
				return nodes[roleName];
			}else{
				nodes.root = this.getRoot();

				if(roleName === 'root'){
					//如果是查找根节点，直接返回
					return nodes.root;
				}else{
					if(roles){
						selector = roles[roleName];
					}else{
						this.conf.roles = {};
					}
					selector = selector || '[data-role="' + roleName + '"]';
					this.conf.roles[roleName] = selector;
					elRole = nodes.root.find(selector);
					if(conf.cacheRole){
						nodes[roleName] = nodes.root.find(selector);
					}
					//其他情况下返回内部对应data-role属性名的元素
					return elRole;
				}
			}
		}
	});

	module.exports = Module;

});

