/**
 * @fileoverview 页面模块基类
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/base/pagelet',function(require,exports,module){

	var $ = require('lib');
	var $module = require('lib/base/module');
	var $layoutM = require('lib/common/layoutM');
	var $channelCommon = require('lib/common/channel');
	var $contentM = require('lib/common/contentM');
	var $loading = require('mods/dialog/loading');

	//页面模块基类
	//提供获取内部角色的方法
	//提供页面模块的DOM插入接口
	//页面模块的实例应当具有唯一性！
	var Pagelet = $module.extend({
		options : {
			//页面模块名称，用于事件的派发
			name : '',
			//dom根节点，如'#pl-home'
			node : '',
			//页面模块的模板
			template : '',
			//加载内容时显示loading
			loading : true
		},
		build : function(){
			var root = this.role('root');
			if(!root.html()){
				this.checkUpdate();
			}
			this.checkStyle();
		},
		setCustEvents : function(action){
			var objs = this.objs;
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			this[action]('attach', getBound('onAttach'));
			this[action]('detach', getBound('onDetach'));
		},
		setListener : function(action){
			var getBound = this.getBound();
			action = action === 'add' ? 'add' : 'remove';
			$channelCommon[action]('contentUpdate', getBound('checkUpdate'));
		},
		//模块内容更新前的操作
		beforeUpdate : function(){
			var root = this.role('root');
			root.hide();
			root.html('');
		},
		//检查模块内容更新
		checkUpdate : function(){
			var that = this;
			var conf = this.get('conf');
			var root = this.role('root');

			this.beforeUpdate();

			var loading;

			var doRequest = function(){
				$contentM.request(conf.name, {
					onSuccess : function(rs){
						if(rs && rs.data){
							that.update(rs.data);
						}
						if(loading){
							loading.hide();
							loading = null;
						}
					}
				});
			};

			//用延时来解决loading无法取得父元素宽度的问题
			//请求执行时，父元素可能还未显示或者插入到DOM中。
			setTimeout(function(){
				if(conf.loading){
					loading = $loading({
						parent : root,
						timeout : 5000,
						onRetry : function(){
							doRequest();
						}
					});
				}
				doRequest();
			});
		},
		//更新组件的内容
		update : function(data){
			var conf = this.get('conf');
			var root = this.role('root');
			var box = data.box;
			root.html( box.getNode(conf.node).html() );
			this.checkStyle();
			this.trigger('updated');
		},
		//检查模块样式
		checkStyle : $.noop,
		onAttach : function(){
			var conf = this.get('conf');
			var attached = this.get('attached');
			if(!attached){return;}
			//确保元素在布局内
			var root = this.role('root');
			if($.type(conf.node) === 'string'){
				$layoutM.insert(conf.node, root, function(){
					this.checkStyle();
				}.bind(this));
			}
			root.show();
		},
		onDetach : function(){
			var root = this.role('root');
			root.hide();
		}
	});

	module.exports = Pagelet;

});

