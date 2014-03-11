/**
 * @fileoverview 编码HTML，将HTML字符转为实体字符
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @param {String} str
 * @return {String} str
 * @from STK
 * @example
	var $encodeHTML = require('lib/kit/str/encodeHTML');
	assertEqual( $encodeHTML('&<>" '), '&amp;&lt;&gt;&quot;$nbsp;' );
 */

define('lib/kit/str/encodeHTML',function(require,exports,module){

	module.exports = function(str){
		if(typeof str !== 'string'){
			throw 'encodeHTML need a string as parameter';
		}
		return str.replace(/\&/g,'&amp;').
			replace(/"/g,'&quot;').
			replace(/\</g,'&lt;').
			replace(/\>/g,'&gt;').
			replace(/\'/g,'&#39;').
			replace(/\u00A0/g,'&nbsp;').
			replace(/(\u0020|\u000B|\u2028|\u2029|\f)/g,'&#32;');
	};

});
