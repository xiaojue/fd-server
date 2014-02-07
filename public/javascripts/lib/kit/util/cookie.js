/**
 * @fileoverview 设置、获取cookie
 * @authors yifei2 <yifei2@staff.sina.com.cn>
 */
define('lib/kit/util/cookie', function(require,exports,module){

    var $ = require('lib');

	var Cookie = {
		set: function(sKey, sValue, oOpts){
			var arr = [];
			var d, t;
			var cfg = $.extend({
				'expire': null,     //过期时间(小时)
				'path': '/',        //路径
				'domain': null,     //域名
				'secure': null,
				'encode': true
			}, oOpts);

			if (cfg.encode === true) {
				sValue = escape(sValue);
			}
			arr.push(sKey + '=' + sValue);

			if (cfg.path !== null) {
				arr.push('path=' + cfg.path);
			}
			if (cfg.domain !== null) {
				arr.push('domain=' + cfg.domain);
			}
			if (cfg.secure !== null) {
				arr.push(cfg.secure);
			}
			if (cfg.expire !== null) {
				d = new Date();
				t = d.getTime() + cfg.expire * 3600000;
				d.setTime(t);
				arr.push('expires=' + d.toGMTString());
			}
			document.cookie = arr.join(';');
		},
		get: function(sKey){
			sKey = sKey.replace( /([\.\[\]\$])/g, '\\$1');
			var rep = new RegExp(sKey + '=([^;]*)?;', 'i');
			var co = document.cookie + ';';
			var res = co.match(rep);
			if (res) {
				return res[1] || "";
			} else {
				return '';
			}
		},
		remove: function(sKey, oOpts){
			oOpts = oOpts || {};
			oOpts.expire = -10;
			this.set(sKey, '', oOpts);
		}
	};

	module.exports = Cookie;

});

