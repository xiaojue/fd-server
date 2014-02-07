/**
 * @fileoverview jquery 函数扩充插件 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/core/extra/jquery/jquery',function(require,exports,module){

	var $ = require('lib/core/jquery/jquery');

	var console = window.console;

	//ie7 console.log是一个对象
	var enableLog = console && typeof console.log === 'function';

	$.extend($, {
		log : function(){
			if(enableLog){
				console.log.apply(console, arguments);
			}
		},
		//驼峰转为连字符格式
		hyphenate : function(str){
			return str.replace(/[A-Z]/g, function($0){
				return '-' + $0.toLowerCase();
			});
		},
		//将 CSS text 替换成加了前缀的格式
		prefixCss : function(value){
			if(!value){return value;}
			['transform'].forEach(function(prop){
				value = value.replace(
					new RegExp(prop, 'gi'),
					$.hyphenate($.cssProps[prop])
				);
			});
			return value;
		}
	});

	$.extend($.fn, {
		//判断事件是否发生在元素内部(包括元素本身)
		occurInside : function(event){
			if(this.length && event && event.target){
				return this[0] === event.target || this.has(event.target).length;
			}
		},
		//触发dom回流
		reflow : function(){
			var reflow = this.size() && this.get(0).clientLeft;
			return this;
		}
	});

});



