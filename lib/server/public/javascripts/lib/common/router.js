/**
 * @fileoverview 路由管理器: 对比路由文件，检测哪些模块需要安装，哪些需要拆卸
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/router',function(require,exports,module){

	var $ = require('lib');
	var $parseURL = require('lib/kit/str/parseURL');
	var $historyM = require('lib/common/historyM');
	var $pageletM = require('lib/common/pageletM');
	var $channel = require('lib/common/channel');
	var $delay = require('lib/kit/func/delay');

	//路由器对象 - 页面模块管理器
	//检查页面链接点击，监听popstate。
	//根据路由表，判断模块的加载与拆卸
	//路由表是一个数组，是一个对应当前地址的模块名称列表
	var Router = {
		conf : {},
		routeList : {},
		matchList : {},
		init : function(options){
			var that = this;
			this.setOptions(options);
			this.build();
			this.setBound();
			$(function(){
				that.setDomEvents('add');
			});
			this.setCustEvents('add');
		},
		setOptions : function(options){
			this.conf = $.extend(true,{
				//路由用于解析地址的根路径
				root : window.location.protocol + '//' + window.location.hostname,
				//是否使用pushState方法
				pushState : true,
				//日否显示模块加载日志
				pageletM : {
					log : false
				}
			}, options);
		},
		build : function(){
			var conf = this.conf;
			$pageletM.init(conf.pageletM);
			this.updateRoute();
		},
		setBound : function(){
			var that = this;
			this.bound = {
				checkLink : function(evt){
					that.checkLink($(this), evt);
				},
				updateRoute : function(){
					that.updateRoute();
				}
			};
		},
		//路由器将会监听整个页面的链接点击事件
		setDomEvents : function(action){
			var bound = this.bound;
			var doc = $(document);
			action = action === 'add' ? 'delegate' : 'undelegate';
			//默认触发链接跳转的事件为 tap
			doc[action]('a', 'tap', bound.checkLink);

			//检查touchend事件，确保引发链接跳转的事件都被阻止
			doc[action]('a', 'touchend', bound.checkLink);

			//在ipad上长按链接会触发click事件，所以需要一并处理
			doc[action]('a', 'click', bound.checkLink);
		},
		setCustEvents : function(action){
			var bound = this.bound;
			action = action === 'add' ? 'on' : 'off';
			$historyM[action]('popstate', bound.updateRoute);
		},
		//检查链接元素的href，判断是否跳转
		checkLink : function(link, evt){
			var conf = this.conf;
			var href = link.attr('href');
			var target = link.attr('target');

			//顺便阻止所有的#链接的默认事件
			if( (/^#+$/).test(href) ){
				evt.preventDefault();
			}

			var preventDefault = false;
			if(evt.isDefaultPrevented && evt.isDefaultPrevented()){
				preventDefault = true;
			}

			if(evt.defaultPrevented || evt.returnValue === false){
				preventDefault = true;
			}

			if(preventDefault){
				//如果发现已经阻止了默认事件，则不再做后续处理
				return;
			}

			if(conf.pushState && !target && href){
				this.setLocation(href, evt);
			}
		},
		//获取格式化后的地址
		//解析出错的地址返回空字符串
		getFormatedUrl : function(url){
			var conf = this.conf;
			var formatedUrl = '';
			var rootLoc = null;
			var loc = null;
			try{
				if(conf.root){
					rootLoc = $parseURL(conf.root);
					if(url === conf.root){
						formatedUrl = conf.root;
					}else{
						loc = url ? $parseURL(url) : $historyM.parseURL() ;
						formatedUrl = loc.url.replace(rootLoc.scheme + '://' + rootLoc.host, '');
					}
				}else{
					loc = url ? $parseURL(url) : $historyM.parseURL() ;
					formatedUrl = loc.url;
				}
			}catch(e){
				formatedUrl = '';
			}
			return formatedUrl.toLowerCase();
		},
		//自定义URL地址
		customUrl : function(url){
			return url;
		},
		//检查链接，如果匹配了路由列表，就阻止默认事件
		//使用 pushState 变更页面地址
		setLocation : function(url, evt){
			url = this.customUrl(url);

			var conf = this.conf;
			var routeName = this.getRouteName(url);
			var loc = $historyM.parseURL().href;
			var options = this.matchList[routeName];
			url = this.getFormatedUrl(url);
			loc = this.getFormatedUrl(loc);

			//common.location组件会直接调用setLocation方法
			//所以这里需要检查Router是否启用了pushState
			if(conf.pushState){
				if(url && routeName && options && options.pushState){
					//要使用pushState做无刷新跳转，需要先阻止当前默认事件
					if(evt){
						evt.preventDefault();
						if(evt.type === 'touchend' || evt.type === 'click' ){
							return;
						}
					}

					//需要检查目标地址与当前地址是否相同
					//避免无意中触发组件的重复拆卸安装
					if(url !== loc){
						$historyM.pushState(url);
					}
				}else{
					//没有事件时，说明这是一个程序发起的地址请求，让地址直接跳转
					//有事件时，任其自行处理
					if(url && !evt){
						window.location.href = url;
					}
				}
			}else{
				//没有事件时，说明这是一个程序发起的地址请求，让地址直接跳转
				//有事件时，任其自行处理
				if(url && !evt){
					window.location.href = url;
				}
			}
		},
		//包装规则
		wrapRule : function(rule){
			var match;
			if($.type(rule) === 'function'){
				match = rule;
			}else if($.type(rule) === 'string'){
				match = function(url){
					return url === rule;
				};
			}else if($.type(rule) === 'regexp'){
				match = function(url){
					return rule.test(url);
				};
			}
			return match;
		},
		//注册路由
		//{String} routeName 路由列表名称，应该为路由列表模块 define 的第一个参数
		//{Mixed} rule 匹配URL地址的规则
		register : function(routeName, rule){
			var match, options;
			if( routeName && $.type(routeName) === 'string'){
				//规则可以是字符串，或者正则表达式，或者函数，甚至对象
				if($.type(rule) === 'object'){
					options = rule;
					match = this.wrapRule(options.match);
				}else{
					match = this.wrapRule(rule);
				}

				//未设置匹配规则，则不去注册路由
				if(!match){return;}

				//当第二个参数为对象时，视为选项
				var ops = $.extend({
					match : $.noop,
					pushState : true	//是否允许对匹配当前规则的链接启用pushState
				}, options);

				//最终规则都被转变为函数
				if(!this.matchList[routeName]){
					if(match){
						ops.match = match;
					}
					this.matchList[routeName] = ops;
				}
			}
		},
		//更新当前页面的路由列表
		updateRoute : function(){
			var url = this.getFormatedUrl();
			var routeName = this.getRouteName(url);
			if(routeName){
				//如果有匹配的路由列表，则加载该路由列表并更新pagelets
				this.loadRoute(routeName);
				$channel.fire('locationChange');
			}else{
				//如果没有匹配的路由列表，则注销所有事件，等待页面更新
				$pageletM.updatePagelets([]);
			}
		},
		//根据url获取对应的路由列表名称
		getRouteName : function(url){
			url = this.getFormatedUrl(url);
			var routeName = '';
			if(url){
				//遍历地址匹配列表，取得匹配当前地址的路由名称
				$.each(this.matchList, function(name, options){
					if(options.match(url)){
						routeName = name;
						return false;
					}
				});
			}
			return routeName;
		},
		//加载路由列表文件
		loadRoute : function(routeName){
			if(!routeName){return;}
			var that = this;
			var route = this.routeList[routeName];
			if(!route){
				lithe.use(routeName, function(list){
					route = list;
					that.routeList[routeName] = route;
					$pageletM.updatePagelets(route);
				});
			}else{
				$pageletM.updatePagelets(route);
			}
		},
		destroy : function(){
			this.setDomEvents('remove');
			this.setCustEvents('remove');
			$pageletM.destroy();
		}
	};

	module.exports = Router;

});


