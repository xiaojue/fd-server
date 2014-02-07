/**
 * @fileoverview transform 区域拖动
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/ui/drag/area',function(require,exports,module){

	var $ = require('lib');
	var $limit = require('lib/kit/num/limit');
	var $draggable = require('lib/ui/draggable');
	var $getScale = require('lib/kit/dom/getScale');
	var $getCoordinates = require('lib/kit/dom/getCoordinates');

	var DragArea = $draggable.extend({
		options : {
			//要绑定拖动事件的目标元素
			node : '',
			//可拖动范围区域元素
			area : '',
			//支持多点触摸拖动
			multiple : false,
			//拖动手柄
			handle : '',
			//不允许横向拖动超出范围 ['inside','outside','both','none']
			disableOverflowX : 'none',
			//不允许纵向拖动超出范围 ['inside','outside','both','none']
			disableOverflowY : 'none',
			//允许X方向的拖动
			enableX : true,
			//允许Y方向的拖动
			enableY : true,
			//监听内部拖动区域事件
			listenToChild : false,
			//是否阻止touchmove默认事件
			preventDefault : true,
			//结束动画的运行方式
			//备选：['cubic-bezier(0, .70, .35, 1)', 'none', 'ease-out']
			easing : 'ease-out'
		},
		getRange : function(node){
			var conf = this.get('conf');
			var defRange = {
				maxX : 10000,
				minX : -10000,
				maxY : 10000,
				minY : -10000
			};
			range = $.extend({}, defRange);
			if(!conf.area){
				return range;
			}

			var transform = node.transform();
			var coordinates = $getCoordinates(node);
			var areaCoordinates = $getCoordinates(conf.area, 'current');

			var compute = function(prop, dir, prev, next){
				var strDir = dir.toUpperCase();
				var inside = coordinates[prop] < areaCoordinates[prop];
				range['overflow' + strDir] = inside ? 'inside' : 'outside';
				range['min' + strDir] = Math.round(
					(inside ? -1 : 1) *
					(areaCoordinates[next] - coordinates[next])
				);
				range['max' + strDir] = Math.round(
					(inside ? -1 : 1) *
					(areaCoordinates[prev] - coordinates[prev])
				);
			};

			compute('width', 'x', 'left', 'right');
			compute('height', 'y', 'top', 'bottom');

			return range;
		},
		limit : function(translate){
			var conf = this.get('conf');
			var range = this.get('range');
			var pos = {};
			pos.x = translate.x;
			pos.y = translate.y;

			if(!conf.enableX){
				pos.x = 0;
			}

			if(!conf.enableY){
				pos.y = 0;
			}

			if(range){
				pos.x = $limit(pos.x, range.minX, range.maxX);
				pos.y = $limit(pos.y, range.minY, range.maxY);
				if(conf.disableOverflowX === range.overflowX || conf.disableOverflowX === 'both'){
					pos.x = 0;
				}
				if(conf.disableOverflowY === range.overflowY || conf.disableOverflowY === 'both'){
					pos.y = 0;
				}
			}
			return pos;
		},
		resetRange : function(){
			var conf = this.get('conf');
			var root = this.role('root');
			var range = this.getRange(root);
			if(conf.area){
				this.set('range', range);
			}
		},
		dragStart : function(evt){
			if(!this.get('disable')){
				this.clearEasing();
				this.resetRange();
				this.trigger('start', evt);
			}
		},
		dragMove : function(evt){
			if(!this.get('disable')){
				var conf = this.get('conf');
				var root = this.role('root');

				if(conf.listenToChild){
					var childOverflow = evt.overflow;
					if(childOverflow){
						evt.dragData.deltaX = childOverflow.x;
						evt.dragData.deltaY = childOverflow.y;
					}
				}

				var dragData = evt.dragData;
				var startTranslate = dragData.startTranslate;
				var translate = {};

				translate.x = Math.floor(startTranslate.x + dragData.deltaX);
				translate.y = Math.floor(startTranslate.y + dragData.deltaY);

				var pos = this.limit(translate);
				root.transform({
					translateX : pos.x + 'px',
					translateY : pos.y + 'px',
					translateZ : 0
				});

				var overflow = {};
				overflow.x = translate.x - pos.x || 0;
				overflow.y = translate.y - pos.y || 0;
				evt.overflow = overflow;

				this.set('moveData', dragData);
				this.set('posData', pos);

				this.trigger('move', evt);
			}
		},
		dragEnd : function(evt){
			var conf = this.get('conf');
			var root = this.role('root');
			var moveData = this.get('moveData');

			if(!this.get('disable') && moveData){
				evt.dragData = moveData;
				if(conf.easing !== 'none'){
					this.easing(evt);
				}
				this.set('moveData', null);
				this.trigger('end', evt);
			}
		},
		easing : function(evt){
			var gesture = evt.gesture;
			if(!gesture){return;}
			var conf = this.get('conf');
			var root = this.role('root');
			var a = 1;
			var t = (gesture.distance / gesture.deltaTime) / a;
			var s = a * t * t / 2;
			var scale = Math.abs(gesture.deltaX / gesture.deltaY);
			scale = scale || 0.01;

			var sx = s * scale / Math.sqrt(Math.pow(scale, 2) + 1);
			var sy = Math.sqrt(Math.pow(s,2) - Math.pow(sx, 2));
			sx = sx || 0;
			sy = sy || 0;

			sx = sx * 800 * (gesture.deltaX > 0 ? 1 : -1);
			sy = sy * 800 * (gesture.deltaY > 0 ? 1 : -1);
			t = 0.6 * t / 2;

			var translate = this.get('posData');
			translate.x = translate.x + sx;
			translate.y = translate.y + sy;

			var pos = this.limit(translate);
			var transform = {};
			transform.translateX = pos.x + 'px';
			transform.translateY = pos.y + 'px';

			root.css({
				'transition-property' : 'all',
				'transition-duration' : t + 's',
				'transition-timing-function' : conf.easing
			});
			root.reflow();
			root.transform(transform);
		},
		clearEasing : function(){
			var conf = this.get('conf');
			var root = this.role('root');
			root.css({
				'transition-property' : '',
				'transition-duration' : '',
				'transition-timing-function' : ''
			});
		},
		enable : function(){
			this.set('disable', false);
		},
		disable : function(){
			this.set('disable', true);
			this.set('dragData', null);
			this.set('moveData', null);
		}
	});

	module.exports = DragArea;

});

