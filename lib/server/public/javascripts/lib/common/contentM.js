/**
 * @fileoverview 内容管理器: 解决获取页面内容的问题 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/contentM',function(require,exports,module){

	var $ = require('lib');
	var $channel = require('lib/common/channel');
	var $location = require('lib/common/location');
	var $user = require('lib/common/user');
	var $transmission = require('lib/common/transmission');
	var $hiddenIframe = require('lib/kit/dom/hiddenIframe');
	var $makeReady = require('lib/kit/util/makeReady');
	var $scope = require('lib/common/scope');

	var RSCRIPT = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
	var RHEAD = /<!DOCTYPE html>[\w\W]*<body\b[^<]*>/gi;
	var RFOOT = /<\/body>[\w\W]*<\/html>/gi;
	var RIFRAME = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;

	//定义内容获取通用接口
	var $trans = new $transmission();

	//获取页面HTML的接口
	$trans.register('content', {
		//使用get请求可以提升访问速度
		//http://www.oncoding.cn/2009/ajax-get-post/
		type : 'get',
		//添加此项，去除get请求附带的随机数
		cache: true,
		dataType : 'html',
		autoExecuteFailure : true,
		url: ''
	});

	//获取特定标签元素的内容
	//param {String} html 要获取内容的源HTML文本
	//param {String} tagName 要获取内容的标签名称
	var getTagContent = function(html, tagName){
		var arr = [];
		var reg = new RegExp('<' + tagName + '\\b[^<]*(?:(?!<\\/' + tagName + '>)<[^<]*)*<\\/' + tagName + '>', 'gi');
		var regClear = new RegExp('<[\\/]*' + tagName + '([^>]?)*>', 'gi');
		var match = reg.exec(html);
		if(match && match[0]){
			arr.push(match[0]);
		}
		while(match && match.length){
			match = reg.exec(html);
			if(match && match[0]){
				arr.push(match[0]);
			}
		}
		return arr.map(function(m){
			return m.replace(regClear,'').replace(/[\r\n]/gi, '');
		});
	};

	//用于缓存页面
	var pageCache = {};

	//地址队列
	var locationQueue = [];

	//记录没有重定向，不是报错页的地址
	var availableUrl = 'http://about:blank';

	//进入的页面地址
	var startUrl = window.location.href;

	//解析器列表
	var parserList = {};

	//解析器简单模型
	var Parser = function(id){
		this.id = id;
		this.active = true;
	};
	Parser.prototype = {
		//解析DOM前的预备工作
		//通常用来设置组件的loading状态
		prepare : $.noop,
		//解析器解析函数，完成对DOM的数据解析
		parse : $.noop,
		//解析器自检
		//是从当前页面DOM中获取数据，还是从iframe加载DOM获取数据
		check : function(){
			var node = $(this.id);
			if(node.length){
				this.parse(node);
			}else{
				ContentManager.checkParser(this.id);
			}
		},
		//激活解析器
		enable : function(){
			this.active = true;
		},
		//禁止解析器
		disable : function(){
			this.active = false;
		}
	};

	//博客内容管理模块
	//在接口实现前负责解析原有页面的内容，获取页面数据
	var ContentManager = {
		//获取用于解析HTML的隐藏iframe
		getIframe : function(){
			if(!this.iframe){
				this.iframe = $hiddenIframe.create();
			}
			return this.iframe;
		},
		//获取当前页面的地址
		getLocation : function(){
			var url = $location.get().url;
			return url.replace(/#.+/, '');
		},
		//保存之前访问的地址到队列中，只保存2个
		saveLocation : function(url){
			if(locationQueue[locationQueue.length - 1] !== url){
				locationQueue.push(url);
			}
			if(locationQueue.length > 2){
				locationQueue.shift();
			}
		},
		//获取前一页地址
		getBeforeLocation : function(){
			return locationQueue[0] || '';
		},
		//构建页面缓存，在页面成功加载后执行回调
		request : function(type, options){
			var that = this;

			var conf = $.extend({
				cache : true,
				onSuccess : $.noop
			}, options);

			//每次请求前检查登录状态是否发生了变更
			$user.checkLoginState();

			//仅需要负责获取当前地址的数据
			var url = this.getLocation();
			var page;

			this.saveLocation(url.toLowerCase());

			if(conf.cache){
				page = pageCache[url];
			}

			//如果未缓存该页面，创建该页面的缓存对象
			if(!page){
				page = pageCache[url] = $makeReady({
					condition : function(){
						return page && page.html;
					},
					ready : function(callback){
						var onSuccess = function(html){
							page.html = html;

							var redirectUrl = that.getRedirectUrl(html);
							var beforeLocation = that.getBeforeLocation();
							var targetUrl = '';

							if(redirectUrl){
								//如果在当前地址的页面取得了要重定向的地址
								//说明该页面为不正常页面
								if(that.isExceptionUrl(redirectUrl)){
									//如果要重定向的页面为错误页
									if(that.isExceptionUrl(beforeLocation)){
										//如果前一页就是错误页，则说明是从错误页往回跳转
										//此时应当跳转到可用页面
										targetUrl = availableUrl;
									}else{
										//否则说明是从当前页要跳转到错误页，直接跳转到重定向页面
										targetUrl = redirectUrl;
									}
								}else{
									//如果重定向的页面不是错误页，直接跳转到要重定向的页面
									targetUrl = redirectUrl;
								}

								//不要缓存重定向的页面
								delete pageCache[url];
								$channel.fire('changeLocation', targetUrl);
							}else{
								if(that.isExceptionUrl(url)){
									//如果当前地址为错误页的地址
									//说明该页面为不正常页面
									callback();

									//先产生回调
									//但不要缓存错误页
									delete pageCache[url];
								}else{
									//其他情况下判定为正常页面
									//记录该页面地址
									availableUrl = url;
									callback();
								}
							}
						};

						if(that.isSameUrl(window.location.href, startUrl)){
							//仅在第一次解析页面时，判断地址是否为进入应用的地址
							//用户再次回到这个地址时，将会重新发起请求。
							startUrl = '';
							setTimeout(function(){
								//makeReady的回调必须在一个延时后发生
								//否则会漏掉处理函数
								onSuccess([
									document.body.innerHTML,
									'<title>', document.title ,'</title>'
								].join(''));
							});
						}else{
							$trans.request('content', {
								url : url,
								onSuccess : onSuccess,
								onFailure : function(){
									delete pageCache[url];
									callback();
								}
							});
						}
					}
				});
			}

			//由该页面的缓存对象回调所需数据
			page.exec(function(){
				var nowUrl = that.getLocation();
				if(nowUrl === url){
					//被缓存的页面未必都是正常页面
					if(!that.isExceptionUrl(url)){
						availableUrl = url;
					}

					var rs = {};
					rs.data = that.parse(page.html);
					if($.type(conf.onSuccess) === 'function'){
						conf.onSuccess(rs);
					}
				}
			});
		},
		//是否为错误页
		isExceptionUrl : function(url){
			url = url + '';
			var result = (/mblog\/controllers\/exception.php/).test(url);
			return result;
		},
		//检查是否为相同地址
		//定义为：除了hash，其他部分都相同
		isSameUrl : function(url1, url2){
			url1 = url1 || '';
			url2 = url2 || '';
			var reg = (/\#.*/gi);
			url1 = url1.replace(reg, '');
			url2 = url2.replace(reg, '');
			return (url1 && url2 && url1 === url2);
		},
		//解析页面内容
		parse : function(html){
			var data = {};

			//将用于解析页面内容的iframe传递出去，给各个组件使用
			//将解析页面内容的逻辑分散到各个组件
			data.box = this.getIframe();

			//只有要解析的内容与之前不同时，才更新iframe中的HTML
			//避免iframe中的html被重复渲染消耗时间
			if(html !== this.currentHtml){
				this.currentHtml = html;

				this.setTitle(html);
				window.scope = $.extend(true, {}, this.getScope(html));
				$scope.update();

				//取得html的body的内容，输出到iframe，然后从中获取某个元素的内容
				html = html.replace(RSCRIPT, '');
				html = html.replace(RHEAD, '');
				html = html.replace(RFOOT, '');
				html = html.replace(RIFRAME, '');

				data.box.html(html);
			}

			data.scope = $.extend(true, {}, window.scope);
			return data;
		},
		//设置当前页面的title
		setTitle : function(html){
			var title = getTagContent(html, 'title')[0] || '';
			$('title').html(title);
		},
		//获取页面上的scope对象
		getScope : function(html){
			var scopeScript = '';
			var scope;
			var scripts = getTagContent(html, 'script');
			if(scripts.length){
				scopeScript = scripts.filter(function(str){
					return (/var scope/gi).test(str);
				})[0];
			}
			if(scopeScript){
				scope = scopeScript.replace(/var\s*scope\s*=\s*/,'').replace('};', '}');
				//避免使用 Function 和 eval，降低遭受XSS攻击的风险
				scope = JSON.parse(scope);
			}
			return scope;
		},
		//获取页面的重定向地址
		getRedirectUrl : function(html){
			var recirectScript = '';
			var redirectUrl = '';
			var scripts = getTagContent(html, 'script');
			if(scripts.length){
				recirectScript = scripts.filter(function(str){
					return (/window.location.href=/gi).test(str);
				})[0];
			}
			if(recirectScript){
				redirectUrl = recirectScript.replace(/window.location.href='|';/gi, '');
			}
			return redirectUrl.toLowerCase();
		},
		//清除当前页面缓存
		clearCache : function(){
			var url = this.getLocation();
			delete pageCache[url];
		},
		//清除所有页面缓存
		clearAllPageCache : function(){
			$.each(pageCache, function(key){
				pageCache[key] = null;
				delete pageCache[key];
			});
		},
		//注册一个内容解析器
		setParser : function(id, fn){
			var node, parser;
			parser = parserList[id];
			if(parser){
				parser.enable();
			}else{
				parser = parserList[id] = new Parser(id);
				if($.isFunction(fn)){
					parser.parse = fn;
					parser.check();
				}
			}
			return parser;
		},
		//移除注册的内容解析器
		removeParser : function(id){
			delete parserList[id];
		},
		//通过ajax获取当前页面实际内容
		//@param plId pagelet组件的id，需要带头部的'#'字符
		checkParser : function(plId){
			if(plId){
				//存在plId参数，则进行单个解析器的检查
				var plParser = parserList[plId];
				if(plParser && plParser.active){
					//只要存在解析器，并且解析器处于激活状态
					//就请求页面内容
					plParser.prepare();
					this.request('parser', {
						onSuccess : function(rs){
							var box, node;
							if(rs && rs.data && rs.data.box){
								box = rs.data.box;
								node = box.getNode(plId);
								plParser.parse(node);
							}
						}
					});
				}
			}else{
				//不存在plId参数，则遍历检查所有解析器
				var execQueue = [];
				$.each(parserList, function(id, parser){
					if(parser.active){
						//将每个解析器设置为准备状态
						//将拿到内容的回调统一放到一个处理队列中
						parser.prepare();
						execQueue.push(function(box){
							var node = box.getNode(id);
							if(node.length){
								if($.isFunction(parser.parse)){
									parser.parse(node);
								}
							}
						});
					}
				});

				//只要处理队列不为空，就发起请求获取组件内容
				//请求内容拿到后，遍历队列处理解析器的解析函数
				if(execQueue.length){
					this.request('parser', {
						onSuccess : function(rs){
							var box, node;
							if(rs && rs.data && rs.data.box){
								box = rs.data.box;
								execQueue.forEach(function(fn){
									fn(box);
								});
							}
						}
					});
				}
			}
		}
	};

	//如果用户状态发生了变更，则需要重置内容缓存
	$channel.on('loginStateChange', function(){
		ContentManager.clearAllPageCache();
		$channel.fire('contentUpdate');
	});

	//如果页面组件发生了更新，则触发内容更新广播事件
	$channel.on('pageletsUpdate', function(){
		$channel.fire('contentUpdate');
	});

	//如果内容发生了更新，则需要检查解析器
	$channel.on('contentUpdate', function(){
		ContentManager.checkParser();
	});

	//有时需要直接删除页面缓存
	//例如删除当前页面
	$channel.on('pageDeleted', function(){
		ContentManager.clearAllPageCache();
	});

	module.exports = ContentManager;

});


