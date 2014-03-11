/**
 * @fileoverview 加载script
 * @desc 该方法为zepto而存在，使用jquery请用$.getScript替代
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/util/loadScript',function(require,exports,module){

	var $ = require('lib');

	module.exports = function(options){
		var conf = $.extend({
			url : '',
			type : 'text/javascript',
			charset : 'utf-8',
			onLoad : $.noop
		}, options);

		var script = $(document.createElement('script'));
		script.on('load', function(){
			conf.onLoad();
			delete script.onload;
			$(script).off().remove();
		}).attr({
			src : conf.url,
			charset : conf.charset,
			type : conf.type
		}).appendTo( $('head') );
	};

});

