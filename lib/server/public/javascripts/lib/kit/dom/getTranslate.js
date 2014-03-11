/**
 * @fileoverview 获取 transform translate 的不带单位的值
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/getTranslate',function(require,exports,module){

	var $ = require('lib');

	module.exports = function(node){
		var transform = $(node).transform();

		var translateX = parseInt(transform.translateX, 10) || 0;
		var translateY = parseInt(transform.translateY, 10) || 0;
		var translateZ = parseInt(transform.translateZ, 10) || 0;

		var translate = transform.translate;
		if(translate){
			translate = translate.split(',');
			translate[0] = translate[0] || 0;
			while(translate.length < 3){
				translate.push(0);
			}
			translate = translate.map(function(str){
				return parseInt(str, 10) || 0;
			});
			translateX = translateX + translate[0];
			translateY = translateY + translate[1];
			translateZ = translateZ + translate[2];
		}

		return {
			x : translateX,
			y : translateY,
			z : translateZ
		};
	};

});

