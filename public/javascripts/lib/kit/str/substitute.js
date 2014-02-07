/**
 * @fileoverview 简单模板函数 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @from Mootools
 * @param {String} str 要替换模板的字符串
 * @param {Object} obj 模板对应的数据对象
 * @param {RegExp} reg 解析模板的正则表达式
 * @return {String} 替换了模板的字符串
 * @example
	var $substitute = require('lib/kit/str/substitute');
	$substitute('{city}欢迎您', {city:'北京'}); //return '北京欢迎您'
 */

define('lib/kit/str/substitute',function(require,exports,module){

	module.exports = function(str, obj, reg){
		return str.replace(reg || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			//注意：obj[name] != null 等同于 obj[name] !== null && obj[name] !== undefined
			return (obj[name] != null) ? obj[name] : '';
		});
	};

});
