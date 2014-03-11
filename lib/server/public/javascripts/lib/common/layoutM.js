/**
 * @fileoverview 页面布局管理器
 * 解决模块DOM位置随布局变化而变更的问题，实现DOM操作的解耦
 * 实际上就是做了一次双向检查。
 * 插入布局时，检查所有已存在模块，将模块安装到对应布局上。
 * 插入模块时，检查所有已存在布局，将模块安装到对应布局上。
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/layoutM',function(require,exports,module){

	var $ = require('lib');

	var pagelets = {};
	var layouts = {};

	//将pagelet/layout对应的DOM添加到布局中
	//param {String} selector 页面模块的选择器，应当用id选择器以避免重复
	//param {Object} object 页面模块根节点jquery对象，或者布局模块对象
	//param {Function} callback 插入成功后的回调
	exports.insert = function(selector, object, callback){
		var item = {};
		if(object instanceof $){
			//对象为jQuery对象，即为pagelet对象
			if(!pagelets[selector]){
				item.id = selector;
				item.type = 'pagelet';
				item.node = object;
				item.callback = callback || $.noop;
				//遍历布局对象，将该布局DOM jQuery对象插入到布局对象中
				$.each(layouts, function(key, obj){
					if(obj.layout && $.isFunction(obj.layout.insert)){
						obj.layout.insert(item.id, item.node, item.callback);
					}
				});
				pagelets[selector] = item;
			}
		}else if(
			$.isFunction(object.type) &&
			object.type() === 'layout'
		){
			//对象为布局对象
			if(!layouts[selector]){
				item.id = selector;
				item.type = 'layout';
				item.layout = object;
				item.node = object.root;
				item.callback = callback || $.noop;
				//将布局对象根节点插入到布局对象列表中
				$.each(layouts, function(key, obj){
					if(obj.layout && $.isFunction(obj.layout.insert)){
						obj.layout.insert(item.id, item.node, item.callback);
					}
				});
				//遍历检查pagelet对象列表，将已存在的pagelet对象插入到该布局对象中
				$.each(pagelets, function(key, obj){
					if($.isFunction(item.layout.insert)){
						item.layout.insert(obj.id, obj.node, obj.callback);
					}
				});
				layouts[selector] = item;
			}
		}
	};

	//将pagelet/layout对应的DOM从布局组件中移除
	//param {String} selector 页面模块的选择器，应当用id选择器以避免重复
	exports.remove = function(selector){
		if(pagelets[selector]){
			delete pagelets[selector];
		}
		if(layouts[selector]){
			delete layouts[selector];
		}
		$.each(layouts, function(key, layout){
			if($.isFunction(layout.remove)){
				layout.remove(selector);
			}
		});
	};

	//将pagelet对应的DOM部署到布局中，替代原有的pagelet
	//param {String} id 模块id
	//param {Object} root 页面模块根节点jquery对象
	//param {Function} callback 插入成功后的回调
	exports.deploy = function(id, root, callback){
		var node = $(id);
		if(
			node.length &&
			!pagelets[id] &&
			!layouts[id]
		){
			node.attr('id', '');
			node.replaceWith(root);
			node = null;
		}
		//确保元素在布局内
		exports.insert(
			id,
			root,
			callback
		);
	};

});
