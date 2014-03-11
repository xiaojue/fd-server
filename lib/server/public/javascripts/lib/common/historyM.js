/**
 * @fileoverview 地址管理器：pushState解决方案
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/historyM',function(require,exports,module){

	var $ = require('lib');
	var $parseURL = require('lib/kit/str/parseURL');
	var $delay = require('lib/kit/func/delay');
	var $model = require('lib/mvc/model');
	var $querystring = require('lib/more/querystring');

	var haveHashchangeEvt = ('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8);

	//获取参数对象
	var getPara = function(item, tag){
		var reg = new RegExp('^\\' + tag + '*');
		var para;
		if($.type(item) === 'string'){
			para = $querystring.parse(
				item.replace(/^\?*/, '')
			);
		}else if($.isPlainObject(item)){
			para = item;
		}
		return para;
	};

	var HistoryM = $model.extend({
		defaults : {
			//域名
			host : '',
			//完整地址
			href : '',
			//去除所有参数的地址
			path : '',
			//hash部分，不包括开头的'#'
			hash : '',
			//search部分，不包括开头的'?'
			query : ''
		},
		build : function(){
			this.delayCheck = $delay(this.delayCheck, 1);
			this.currentHref = '';
			this.popState();
		},
		setEvents : function(action){
			var proxy = this.proxy();
			$(window).on('popstate', proxy('onPopState'));
			if(haveHashchangeEvt){
				$(window).on('hashchange', proxy('onHashChange'));
			}
		},
		//监听popstate的事件函数
		onPopState : function(){
			this.ignoreHash = false;
			this.stateChange();
		},
		//更新hash对象
		onHashChange : function(){
			this.parse();
			this.trigger('hashchange');
		},
		//地址变更检查
		stateChange : function(){
			var href = this.parseURL().url;
			var currentHref = this.currentHref;
			//仅在pushState时区分hash
			if(this.ignoreHash){
				href = href.replace(/#.*$/, '');
				currentHref = currentHref.replace(/#.*$/, '');
			}
			if(href !== currentHref){
				this.popState();
			}
		},
		//检测状态变化后的事件处理
		popState : function(){
			this.parse();
			this.trigger('popstate');
		},
		//解析当前地址，更新当前地址对象
		parse : function(){
			var loc = this.parseURL();
			this.currentHref = loc.url;
			this.ignoreHash = true;
			this.set({
				host : loc.host,
				href : loc.url,
				path : loc.path,
				hash : loc.hash,
				query : loc.query
			});
		},
		//解析一个URL，确保有一个地址完整的属性
		//可以解析的URL包括同域路径，完整路径
		//单独的query和hash要补足地址
		parseURL : function(url){
			url = url || window.location.href;
			//如果地址不是http:之类的开头，或者不是'/'字符开头
			//在开头加上'/'字符确保$parseURL方法能够正常解析地址
			if( !(/^([a-z]+\:|\/)/i).test(url) ){
				url = '/' + url;
			}
			var loc = $parseURL(url);
			var nowLoc = $parseURL(window.location.href);
			loc.host = loc.host || nowLoc.host;
			loc.scheme = loc.scheme || nowLoc.scheme;
			loc.url = [
				loc.scheme + ':',
				(loc.slash || '//'),
				loc.host,
				'/' + loc.path,
				(loc.query ? '?' + loc.query : ''),
				(loc.hash ? '#' + loc.hash  : '')
			].join('');
			loc.path = '/' + loc.path;
			return loc;
		},
		//获取当前完整地址
		getURL : function(){
			return this.get('href');
		},
		//以pushState方式设置url
		//如果不支持pushState, 直接跳转
		//如果跨域，直接跳转
		pushState : function(url){
			var loc = this.parseURL(url);
			var nowLoc = this.parseURL();
			if(
				loc.host === nowLoc.host &&
				loc.scheme === nowLoc.scheme &&
				$.isFunction(window.history.pushState)
			){
				this.ignoreHash = false;
				window.history.pushState(null, null, loc.url);
				this.stateChange();
				this.delayCheck(url);
			}else{
				window.location.href = url;
			}
		},
		//延时检查地址
		delayCheck : function(url){
			var expectHref = this.parseURL(url).url.replace(/#.*$/, '');
			var nowHref = this.parseURL().url.replace(/#.*$/, '');
			if(expectHref !== nowHref){
				window.location.href = expectHref;
			}
		},
		//以触发pushState方式设置location.search
		setQuery : function(query){
			query = getPara(query, '?');
			if(!query){return;}
			query = $querystring.stringify(query);
			this.pushState([
				this.get('path'),
				( query ? '?' + query : '' )
			].join(''));
		},
		//以pushState方式设置hash
		pushHash : function(hash){
			hash = getPara(hash, '#');
			if(!hash){return;}
			var query = this.get('query');
			hash = $querystring.stringify(hash);
			this.pushState([
				this.get('path'),
				( query ? '?' + query : '' ),
				( hash ? '?' + hash : '' )
			].join(''));
		},
		//正常设置hash，不使用pushState
		setHash : function(hash){
			hash = getPara(hash, '#');
			if(!hash){return;}
			hash = $querystring.stringify(hash);
			//直接设置window.location.hash会留下历史记录
			var baseUrl = window.location.toString().replace(/#.*$/, '');
			window.location.replace(baseUrl + '#' + hash);
			if(!haveHashchangeEvt){
				this.onHashChange();
			}
		}
	});

	module.exports = new HistoryM();

});
