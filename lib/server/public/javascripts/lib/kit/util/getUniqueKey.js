/**
 * @fileoverview 获取唯一ID 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/util/getUniqueKey',function(require,exports,module){

	var time = + new Date(), index = 1;

	//生成一个不重复的随机字符串
	module.exports = function() {
		return ( time + (index++) ).toString(16);
	};

});

