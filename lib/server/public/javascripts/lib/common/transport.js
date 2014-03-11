/**
 * @fileoverview 通用接口组件
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/transport',function(require,exports,module){

	var $ = require('lib');
	var $layer = require('lib/common/layer');
	var $channel = require('lib/common/channel');
	var $attempt = require('lib/kit/util/attempt');
	var $network = require('lib/kit/env/network');

	//下面的选项中，未在 privatePropList 中列举的属性都会被传递给$.ajax方法
	//没有列举全部$.ajax的选项，可根据需要自行添加其他选项
	var defConf = {
		url : '',			//请求地址
		async : true,		//是否异步
		type : 'POST',		//请求方式 ['POST','GET','PUT','DELETE']
		cache : false,		//是否缓存请求
		data : {},			//发送到服务器的数据
		dataType : 'json',	//预期服务器返回的数据类型 ['text','xml','html','script','json','jsonp']

		//下列属性在dataType为jsonp模式下启用
		jsonp : 'callback',			//jsonp请求参数名称
		scriptCharset : 'utf-8'		//script的编码
	};

	//下面的属性不会传递给$.ajax
	var extraProp = {
		name : '',					//接口名称
		//与后端约定，返回的json数据中，标记成功的status值
		//其他均为失败
		statusSuccess : 'A00006',	//标识成功的状态数据
		timeout : 0,				//超时时间(ms)，为0则取消超时判断
		autoExecuteError : false,	//自动处理错误码
		autoExecuteFailure : false,	//自动处理请求失败的情况
		onComplete : $.noop,		//无论成功失败，请求后都会执行的回调
		onSuccess : $.noop,			//成功后执行的回调
		onFailure : $.noop			//失败后执行的回调
	};

	//privatePropList 中列举的属性不会被传递给$.ajax方法
	var privatePropList = [];

	$.each(extraProp, function(key, val){
		privatePropList.push(key);
		defConf[key] = val;
	});

	//数据缓存
	var Cache = {
		CACHE : {},
		set : function(key, val){
			this.CACHE[key] = val;
		},
		get : function(key){
			return this.CACHE[key];
		}
	};

	// Transport
	// -----------------
	// 封装jQuery.ajax
	var Ajax = function(options){
		this.conf = $.extend({}, options);
		this.request();
	};
	$.extend(Ajax.prototype, {
		constructor : Ajax,
		request : function(){
			var ajaxOptions;
			var cacheData;
			var conf = this.conf;
			ajaxOptions = $.extend({}, conf);

			var cacheKey = [
				conf.name,
				conf.url,
				JSON.stringify(conf.data)
			].join();

			if(this.requesting){return;}
			this.xhr = null;
			this.requesting = true;

			//conf 为当前配置项
			//ajaxOptions 才是会传递给$.ajax的选项
			privatePropList.forEach(function(prop){
				delete ajaxOptions[prop];
			});

			//处理获得的数据
			var executeData = function(data, textStatus, jqXHR){
				if(data && data.code){
					data.code = data.code.toString();
				}
				if(conf.dataType === 'json' || conf.dataType === 'jsonp'){
					if( data.code === conf.statusSuccess ){
						this.success(data, {
							status : textStatus,
							xhr : jqXHR
						});
					}else{
						this.failure(data, {
							status : 'wrongcode',
							xhr : jqXHR
						});
					}
				}else{
					this.success(data, {
						status : textStatus,
						xhr : jqXHR
					});
				}
			}.bind(this);

			//如果标记了接口需要缓存，则先从缓存中获取数据
			cacheData = Cache.get(cacheKey);
			if(conf.cache && cacheData){
				executeData(cacheData, 'cache');
				return;
			}

			//判断是否联网
			if(!$network.onLine()){
				this.failure({}, {
					status : 'offline'
				});
				return;
			}

			ajaxOptions.success = function(data, textStatus, jqXHR){
				if(conf.cache && data){
					Cache.set(cacheKey, data);
				}
				executeData(data, textStatus, jqXHR);
			}.bind(this);
			ajaxOptions.error = function(jqXHR, textStatus, errorThrown){
				this.failure({}, {
					error : errorThrown,
					status : textStatus,
					xhr : jqXHR
				});
			}.bind(this);

			//超时处理
			if(conf.timeout){
				this.timer = setTimeout(function(){
					this.timer = null;
					if(this.requesting){
						this.failure({}, {
							status : 'timeout',
							xhr : this.xhr
						});
						this.abort();
					}
				}.bind(this), conf.timeout);
			}

			this.xhr = $.ajax(ajaxOptions);
		},
		complete : function(rs, extra){
			var conf = this.conf;
			$attempt(function(){
				if(this.requesting){
					conf.onComplete(rs, extra);
				}
			}, {
				name : conf.name + ' ajax complete',
				bind : this
			});
		},
		success : function(rs, extra){
			var conf = this.conf;
			this.complete(rs, extra);
			$attempt(function(){
				if(this.requesting){
					conf.onSuccess(rs, extra);
				}
			}, {
				name : conf.name + ' ajax success',
				bind : this
			});
			this.detach();
		},
		failure : function(rs, extra){
			var conf = this.conf;
			this.complete(rs, extra);
			$attempt(function(){
				if(this.requesting){
					conf.onFailure(rs, extra);
					if(conf.autoExecuteError){
						this.autoExecuteError(rs, extra);
					}
					if(conf.autoExecuteFailure){
						this.autoExecuteFailure(rs, extra);
					}
				}
			}, {
				name : conf.name + ' ajax failure',
				bind : this
			});
			this.detach();
		},
		//自动处理错误码
		autoExecuteError : function(rs, extra){
			var message = $.type(rs.msg) === 'string' ? rs.msg : '';
			if(rs && rs.code){
				if(rs.code === 'A00004'){
					//需要登录
					$channel.fire('needLogin');
				}else if(rs.code === '100002'){
					$channel.fire('changeLocation', rs.data);
				}else if(message){
					//通用错误处理
					$layer.tip(message);
				}
			}
		},
		//自动处理AJAX失败
		autoExecuteFailure : function(rs, extra){
			if( (!rs || !rs.code) && extra){
				if(extra.status === 'offline'){
					$layer.tip('网络连接已断开，请检查网络连接');
				}if(extra.status === 'timeout'){
					$layer.tip('请求超时，请检查网络连接');
				}else if(extra.status === 'abort'){
					$layer.tip('请求已取消');
				}
			}
		},
		//想要阻止请求发送时应该调用这个方法，可以产生失败回调
		cancel : function(){
			var conf = this.conf;
			if(this.requesting){
				this.failure({}, {
					status : 'cancel',
					xhr : this.xhr
				});
				this.abort();
			}
		},
		//这个方法阻止了请求，但不会产生失败回调
		abort : function(){
			var conf = this.conf;
			if(this.timer){
				clearTimeout(this.timer);
				this.timer = null;
			}
			if(this.xhr){
				if(conf.dataType !== 'jsonp' && conf.dataType !== 'script'){
					this.xhr.abort();
				}
			}
		},
		//解除绑定的回调
		detach : function(){
			var conf = this.conf;
			this.requesting = false;
			conf.onComplete = $.noop;
			conf.onSuccess = $.noop;
			conf.onFailure = $.noop;
		}
	});

	// Transport
	// -----------------
	// 进一步封装jQuery.ajax
	var Transport = function(options){
		this.conf = $.extend({}, defConf, options);
		this.cache = {};
	};

	$.extend(Transport.prototype, {
		constructor : Transport,
		//执行请求
		request : function(options){
			var ajaxOptions = $.extend({}, this.conf, options);
			this.ajax = new Ajax(ajaxOptions);
			return this.ajax;
		},
		//取消当前请求
		//注意：取消请求未必能实际的阻止信息传递到服务端，尤其在jsonp的情况下。
		cancel : function(){
			if(this.ajax){
				this.ajax.cancel();
			}
		},
		destroy : function(){
			if(this.ajax){
				this.ajax.cancel();
				delete this.ajax;
			}
		}
	});

	module.exports = Transport;
});

