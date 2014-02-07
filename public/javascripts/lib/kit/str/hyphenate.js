/**
 * @fileoverview 将驼峰格式变为连字符格式
 * @author Liangdong | liangdong2@staff.sina.com.cn
 * @param {String} str
 * @return {String} str
 * @from Mootools
 * @example
	var $hyphenate = require('lib/kit/str/hyphenate');
	assertEqual( $hyphenate('&<>" '), '&amp;&lt;&gt;&quot;$nbsp;' );
 */

define('lib/kit/str/hyphenate',function(require,exports,module){

	module.exports = function(str){
		return str.replace(/[A-Z]/g, function($0){
			return '-' + $0.toLowerCase();
		});
	};

});
