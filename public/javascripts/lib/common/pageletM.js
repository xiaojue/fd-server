/**
 * @fileoverview 页面模块管理器: 管理模块的安装与拆卸
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/pageletM',function(require,exports,module){

	var $ = require('lib');
	var $channel = require('lib/common/channel');

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

	var PageletManager = {
		init : function(options){
			this.conf = {};
			this.pagelets = {};
			this.setOptions(options);
		},
		setOptions : function(options){
			this.conf = $.extend({
				log : false
			}, options);
		},
		log : function(){
			if(this.conf.log){
				$.log.apply($, arguments);
			}
		},
		//创建/包装一个pagelet
		create : function(obj, path){
			var that = this;

			path = path || '';
			if(!obj){
				that.log('Pagelet [' + path + '] is null .');
				obj = {};
			}

			['init','attach','detach','destroy'].forEach(function(method){
				if(!$.isFunction(obj[method])){
					that.log('Pagelet [' + path + '] need method : ' + method + ' .');
					obj[method] = $.noop;
				}
			});

			var inited = false;
			var attached = false;
			var pagelet = $.extend({}, obj, {
				init : function(){
					if(!inited){
						obj.init.apply(pagelet, arguments);
						that.log('['+path+']:', 'init');
						inited = true;
					}
				},
				attach : function(){
					if(!inited){
						this.init();
					}
					if(!attached){
						traverse.call(this, 'attach');
						obj.attach.apply(pagelet, arguments);
						that.log('['+path+']:', 'attach');
						attached = true;
					}
				},
				detach : function(){
					if(!inited){
						return;
					}
					if(attached){
						traverse.call(this, 'detach');
						obj.detach.apply(pagelet, arguments);
						that.log('['+path+']:', 'detach');
						attached = false;
					}
				},
				destroy : function(){
					if(inited){
						this.detach();
						traverse.call(this, 'destroy');
						obj.destroy.apply(pagelet, arguments);
						that.log('['+path+']:', 'destroy');
						inited = false;
					}
				}
			});
			return pagelet;
		},
		//更新当前页面的路由列表的状态
		//根据路由列表安装或者拆卸模块
		updatePagelets : function(pagelets){
			if(!Array.isArray(pagelets)){return;}

			var currentPagelets = this.currentPagelets || {};

			var newPagelets = pagelets.reduce(function(obj, key){
				obj[key] = true;
				return obj;
			}, {});

			//要加载的模块，是当前页面模块列表中不存在的模块
			var attaches = pagelets.filter(function(key){
				return !currentPagelets[key];
			});

			//要拆卸的模块，是新路由表中不存在的模块
			var detaches = Object.keys(currentPagelets).filter(function(key){
				return !newPagelets[key];
			});

			this.currentPagelets = newPagelets;

			//应该先拆卸现有的模块，再安装新的模块
			//错误的顺序会导致模块初始化逻辑的混乱
			detaches.forEach(this.detachPagelet, this);
			attaches.forEach(this.attachPagelet, this);

			$channel.fire('pageletsUpdate');
		},
		//下载页面模块
		loadPagelet : function(path){
			var that = this;
			var plobj = this.pagelets[path];

			lithe.use(path, function(pagelet){
				plobj.pagelet = that.create(pagelet, path);

				//考虑到模块状态有可能在下载完成前变化
				if(plobj.attached){
					that.callAttach(plobj);
				}else{
					that.callDetach(plobj);
				}
			});
		},
		//获取页面模块
		getPagelet : function(path){
			var pagelet = this.pagelets[path];
			if(!pagelet){
				//创建页面模块对象，并下载页面模块
				pagelet = this.pagelets[path] = {
					attached : false,
					pagelet : null
				};
				this.loadPagelet(path);
			}
			return pagelet;
		},
		//调用模块的安装方法
		callAttach : function(plobj){
			if(plobj && plobj.pagelet && $.isFunction(plobj.pagelet.attach)){
				plobj.pagelet.attach();
			}
		},
		//调用模块的拆卸方法
		callDetach : function(plobj){
			if(plobj && plobj.pagelet && $.isFunction(plobj.pagelet.detach)){
				plobj.pagelet.detach();
			}
		},
		//安装页面模块
		attachPagelet : function(path){
			var plobj = this.getPagelet(path);
			this.callAttach(plobj);
			plobj.attached = true;
		},
		//拆卸页面模块
		detachPagelet : function(path){
			var plobj = this.getPagelet(path);
			this.callDetach(plobj);
			plobj.attached = false;
		},
		//销毁模块管理器时，遍历销毁所有模块
		destroy : function(){
			var that = this;
			$.each(this.pagelets, function(name, pl){
				if(pl && pl.pagelet){
					that.callDetach(pl);
					pl.attached = false;
					if($.isFunction(pl.pagelet.destroy)){
						pl.pagelet.destroy();
					}
				}
			});
		}
	};

	module.exports = PageletManager;

});


