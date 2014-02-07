/**
 * @fileoverview 获取 transform rotate 的不带单位的值
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/getRotate',function(require,exports,module){

	var $ = require('lib');

	module.exports = function(node){
		var transform = $(node).transform();

		var rotateX = parseFloat(transform.rotateX, 10) || 0;
		var rotateY = parseFloat(transform.rotateY, 10) || 0;
		var rotateZ = parseFloat(transform.rotateZ, 10) || 0;

		var rotate = transform.rotate;
		if(rotate){
			rotate = parseFloat(rotate, 10) || 0;
			rotateZ = rotateZ + rotate;
		}

		return {
			x : rotateX,
			y : rotateY,
			z : rotateZ
		};
	};

});

