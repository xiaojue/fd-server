/**
 * @fileoverview 获取dom坐标，计算transform的影响
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/kit/dom/getCoordinates',function(require,exports,module){

	var $ = require('lib');
	var $getTranslate = require('lib/kit/dom/getTranslate');
	var $getScale = require('lib/kit/dom/getScale');

	module.exports = function(node, type){
		node = $(node);
		var transform = node.transform();
		var translate = $getTranslate(node);
		translate.x = translate.x || 0;
		translate.y = translate.y || 0;

		var width, height;
		var elWidth = node.width();
		var elHeight = node.height();
		var scale = $getScale(node);

		var rotate = Math.floor( parseInt(transform.rotate, 10) || 0 );

		if(Math.floor(rotate / 90) % 2 === 0){
			width = elWidth * scale.x;
			height = elHeight * scale.y;
		}else{
			width = elHeight * scale.y;
			height = elWidth * scale.x;
		}

		var offset = node.offset();
		var originalOffset;
		if(type === 'current'){
			originalOffset = {
				top : offset.top,
				left : offset.left
			};
		}else{
			originalOffset = {
				top : offset.top - translate.y,
				left : offset.left - translate.x
			};
		}

		var coordinates = {
			width : width,
			height : height,
			top : originalOffset.top,
			right : originalOffset.left + width,
			bottom : originalOffset.top + height,
			left : originalOffset.left
		};

		$.each(coordinates, function(key, val){
			coordinates[key] = Math.round(val);
		});

		$.extend(coordinates, {
			scaleX : scale.x,
			scaleY : scale.y
		});

		return coordinates;
	};

});

