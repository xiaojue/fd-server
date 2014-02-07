/**
 * @fileoverview 页面统一隐藏容器工具 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/hiddenContainer',function(require,exports,module){

	var $ = require('lib');

/**
 * 页面统一隐藏容器工具
 * @author liangdong2@staff.sina.com.cn
 * @example
	var $hiddenContainer = require('lib/kit/dom/hiddenContainer');
	$hiddenContainer.append('<div></div>');
 */
	var hiddenNode;

	var getHiddenNode = function(){
		if(!hiddenNode){
			hiddenNode = $('<div></div>').css({
				'display' : 'none',
				'position' : 'absolute',
				'top' : '-9999px',
				'left' : '-9999px'
			}).appendTo($('body'));
		}
		return hiddenNode;
	};

	module.exports = {
		append : function(node){
			getHiddenNode().append($(node));
		},
		clear : function(){
			getHiddenNode().html('');
		},
		get : function(){
			return getHiddenNode();
		}
	};

});
