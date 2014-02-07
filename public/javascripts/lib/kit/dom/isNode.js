/**
 * @fileoverview 判断对象是否为dom元素
 * @param {Element} node
 * @return {Boolean} true/false
 * @author Robin Young | yonglin@staff.sina.com.cn
 */
define('lib/kit/dom/isNode',function(require,exports,module){

	module.exports = function(node){
		return (node != undefined) && Boolean(node.nodeName) && Boolean(node.nodeType);
	};

});


