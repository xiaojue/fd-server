/**
 * @fileoverview 确认对象是否在数组中，不存在则将对象插入到数组中
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {Array} arr 要操作的数组
 * @param {Mixed} item 要插入的对象
 * @example
	var $include = include('lib/kit/arr/include');
	console.debug($include([1,2,3],4));	//[1,2,3,4]
	console.debug($include([1,2,3],3));	//[1,2,3]
 */

define('lib/kit/arr/include',function(require,exports,module){

	var $contains = require('lib/kit/arr/contains');
	module.exports = function(arr, item){
		if (!$contains(arr, item)) arr.push(item);
		return arr;
	};

});

