/**
 * @fileoverview 全角字转半角字
 * @author yuwei | yuwei@staff.sina.com.cn
 * @param {String} str
 * @return {String} str
 * @from STK
 * @example
	var $dbcToSbc = require('lib/kit/str/dbcToSbc');
	assertEqual( $dbcToSbc('ＳＡＡＳＤＦＳＡＤＦ'), 'SAASDFSADF' );
 */

define('lib/kit/str/dbcToSbc',function(require,exports,module){

	module.exports = function(str){
		return str.replace(/[\uff01-\uff5e]/g,function(a){
			return String.fromCharCode(a.charCodeAt(0)-65248);
		}).replace(/\u3000/g," ");
	};

});
