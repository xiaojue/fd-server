/**
 * @fileoverview 解码HTML，将实体字符转换为HTML字符
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @param {String} str
 * @return {String} str
 * @from STK
 * @example
	var $decodeHTML = require('lib/kit/str/decodeHTML');
	assertEqual( $decodeHTML('&amp;&lt;&gt;&quot;$nbsp;'), '&<>" ' );
 */

define('lib/kit/str/decodeHTML',function(require,exports,module){

	module.exports = function(str){
		if(typeof str !== 'string'){
			throw 'decodeHTML need a string as parameter';
		}
		return str.replace(/&quot;/g,'"').
			replace(/&lt;/g,'<').
			replace(/&gt;/g,'>').
			replace(/&#39;/g,'\'').
			replace(/&nbsp;/g,'\u00A0').
			replace(/&#32;/g,'\u0020').
			replace(/&amp;/g,'\&');
	};

});
