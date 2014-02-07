/**
 * @fileoverview 限制数字在一个范围内
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {Number} num 要限制的数字
 * @param {Number} min 最小边界
 * @param {Number} max 最大边界
 * @returns {Number} 经过限制的数值
 * @example
	var $limit = require('lib/kit/num/limit');
	$limit(1, 5, 10);	//return 5
	$limit(6, 5, 10);	//return 6
	$limit(11, 5, 10);	//return 10
 */
define('lib/kit/num/limit', function(require,exports,module) {

	module.exports = function(num, min, max){
		return Math.min( Math.max(num, min), max );
	};

});


