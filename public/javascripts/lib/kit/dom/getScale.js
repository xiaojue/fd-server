/**
 * @fileoverview 获取 transform scale 的不带单位的值
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/getScale',function(require,exports,module){

	var $ = require('lib');

	module.exports = function(node){
		node = $(node);
		var transform = node.transform();
		var scaleX = parseFloat(transform.scaleX, 10) || 1;
		var scaleY = parseFloat(transform.scaleY, 10) || 1;
		var scaleZ = parseFloat(transform.scaleZ, 10) || 1;

		var scale = transform.scale;
		if(scale){
			scale = scale.split(',');
			scale[0] = scale[0] || 1;
			if(scale.length < 2){
				scale = scale.concat([scale[0],scale[0]]);
			}else if(scale.length < 3){
				scale.push(1);
			}
			while(scale.length < 3){
				scale.push(scale[0]);
			}
			scale = scale.map(function(str){
				return parseFloat(str, 10) || 1;
			});
			scaleX = scaleX * scale[0];
			scaleY = scaleY * scale[1];
			scaleZ = scaleZ * scale[2];
		}

		return {
			x : scaleX,
			y : scaleY,
			z : scaleZ
		};
	};

});

