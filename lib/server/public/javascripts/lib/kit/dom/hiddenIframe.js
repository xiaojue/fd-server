/**
 * @fileoverview 隐藏iframe工具 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/hiddenIframe',function(require,exports,module){

	var $ = require('lib');
	var $hiddenContainer = require('lib/kit/dom/hiddenContainer');

	var HiddenIframe = {
		init : function(options){
			this.setOptions(options);
			this.build();
		},
		setOptions : function(options){
			this.conf = $.extend({

			}, options);
		},
		build : function(){
			this.iframe = $('<iframe></iframe>').css('display', 'none');
			$hiddenContainer.append(this.iframe);
			['window','document'].forEach(function(tag){
				this[tag] =  $(this.iframe[0].contentWindow[tag]);
			}, this);
			this.body = this.document.find('body');
			this.body.hide();
		},
		html : function(){
			return this.body.html.apply(this.body, arguments);
		},
		getNode : function(selector){
			return this.document.find(selector);
		},
		destroy : function(){
			this.conf = null;
			this.window = null;
			this.document = null;
			this.body = null;
		}
	};

	exports.create = function(options){
		var obj = Object.create(HiddenIframe);
		obj.init(options);
		return obj;
	};

});


