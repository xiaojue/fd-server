/**
 * @fileoverview 布局模块基类
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/base/layout',function(require,exports,module){

	var $ = require('lib');
	var $controller = require('lib/mvc/controller');

	//布局模块基类
	//提供页面模块的DOM插入接口
	//布局模块的实例应当具有唯一性！
	var Layout = $controller.extend({
		defaults : {
			//模块与内部容器的映射
			//如'#pl-home-box':['#pl-navigation','#pl-home']
			map : {}
		},
		setEvents : function(action){
			var proxy = this.proxy();
			this.delegate(action);
			this[action]('attach', proxy('onAttach'));
			this[action]('detach', proxy('onDetach'));
		},
		//返回组件类型
		type : function(){
			return 'layout';
		},
		//判断模块是否可以插入这个布局模块
		include : function(selector){
			var result = false;
			$.each(this.conf.map, function(boxId, list){
				if(list.indexOf(selector) >= 0){
					result = true;
					return false;
				}
			});
			return result;
		},
		//提供模块DOM插入接口
		//这里提供了默认的向一个模块容器插入DOM的方式
		//也可以覆盖此方法自定义模块插入的方式
		insert : function(selector, node, callback){
			var that = this;
			var conf = this.conf;
			var root = this.root;
			$.each(conf.map, function(boxId, list){
				var box;
				if(boxId === 'root'){
					box = root;
				}else{
					box = root.find(boxId);
				}
				var prevList, prevNode;
				var index = list.indexOf(selector);
				if(index >= 0){
					//获取前面可能已存在的pagelet
					prevList = list.slice(0, index).filter(function(id){
						return !!$(id).length;
					});
					//如果前面没有已插入到布局中的模块
					//就直接在最前面插入当前pagelet
					if(!prevList.length){
						box.prepend(node);
					}else{
						prevNode = $(prevList[prevList.length - 1]);
						node.insertAfter(prevNode);
					}
					if($.isFunction(callback)){
						callback();
					}
					that.trigger('insert', selector);
					return false;
				}
			});
		}
	});

	module.exports = Layout;

});

