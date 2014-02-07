/**
 * @fileoverview 模板管理器
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	var $tpl = require('lib/kit/util/template');
	var TPL = $tpl({
		item : [
			'<div>',
				'<a href="#">test</a>',
			'</div>'
		]
	});
	TPL.get('item');	//'<div><a href="#">test</a></div>'
 */
define('lib/kit/util/template',function(require,exports,module){

	var $ = require('lib');

	module.exports = function(obj){
		var tpl = {};
		var that = {};
		
		that.set = function(object){
			$.extend(that, object);
			$.extend(tpl, object);
		};

		that.get = function(name){
			var str = '';
			var part = tpl[name];
			if(part){
				if(typeof part === 'string'){
					str = part;
				}else if(Array.isArray(part)){
					tpl[name] = str = part.join('');
				}
			}
			return str;
		};

		that.set(obj);

		return that;
	};

});

