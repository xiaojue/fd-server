/**
 * @fileoverview 修正补位
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {String} str 字符串
 * @param {Number} w 补位数量
 * @returns {String} 经过补位的字符串
 * @example
	var $fixTo = require('lib/kit/num/fixTo');
	$fixTo('0',2);	//return '00'
 */
define('lib/kit/num/fixTo', function(require,exports,module) {

	module.exports = function(str, w){
		str = str.toString();
		w = Math.max((w || 2) - str.length + 1, 0);
		return	new Array(w).join('0') + str;
	};

});


