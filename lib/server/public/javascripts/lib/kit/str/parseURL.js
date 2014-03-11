/**
 * @fileoverview 解析URL 
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @param {String} str
 * @return {Object} that
 * @example
	var $parseURL = require('lib/kit/str/parseURL');
	assertEqual( $parseURL('http://t.sina.com.cn/profile?beijing=huanyingni') , {
		hash : ''
		host : 't.sina.com.cn'
		path : 'profile'
		port : ''
		query : 'beijing=huanyingni'
		scheme : http
		slash : '//'
		url : 'http://t.sina.com.cn/profile?beijing=huanyingni'
	});
 */

define('lib/kit/str/parseURL',function(require,exports,module){

	module.exports = function(url){
		var parse_url = /^(?:([A-Za-z]+):(\/{0,3}))?([0-9.\-A-Za-z]+\.[0-9A-Za-z]+)?(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
		var names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
		var results = parse_url.exec(url);
		var that = {};
		for (var i = 0, len = names.length; i < len; i += 1) {
			that[names[i]] = results[i] || '';
		}
		return that;
	};

});
