/**
 * @fileoverview 获取字符串长度，一个中文算2个字符
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @param {String} str
 * @return {Number} n
 * @from STK
 * @example
	var $bLength = require('lib/kit/str/bLength');
	assertEqual( $bLength('中文cc'), 6 );
 */

define('lib/kit/str/bLength',function(require,exports,module){

	module.exports = function(str){
		if (!str) {
			return 0;
		}
		var aMatch = str.match(/[^\x00-\xff]/g);
		return (str.length + (!aMatch ? 0 : aMatch.length));
	};

});
