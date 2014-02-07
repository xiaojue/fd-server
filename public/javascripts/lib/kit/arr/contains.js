/**
 * @fileoverview 确认对象是否在数组中 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @param {Array} arr 要操作的数组
 * @param {Mixed} item 要搜索的对象
 * @return {Boolean} 如果对象在数组中，返回true
 * @example
	var $contains = require('kit/util/contains');
	console.debug($contains([1,2,3,4,5],3));	//true
 */

define('lib/kit/arr/contains',function(require,exports,module){

	module.exports = function(arr, item){
		var index = arr.indexOf(item);
		return index >= 0;
	};

});


