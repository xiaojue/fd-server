/**
 * @fileoverview transform 拂动滑块
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	//root/_html/test/flick-slide.html
	//root/js/test/flick/slide.js
 */
define('lib/ui/flick/slide', function(require,exports,module){

	var $ = require('lib');
	var $module = require('lib/base/module');
	var $limit = require('lib/kit/num/limit');
	var $draggable = require('lib/ui/draggable');
	var $delay = require('lib/kit/func/delay');

	var FlickSlide = $module.extend({
		options : {
			//根节点
			node : '',
			//弹性系数 [0, 1]
			flex : 0.25,
			//方向 ['x', 'y']
			direction : 'x',
			//结束动画的时间(ms)
			duration : 300,
			//结束动画的运行方式
			easing : 'cubic-bezier(0, .70, .35, 1)'
		},
		build : function(){
			var conf = this.conf;
			var elList = this.role('list');
			var objs = this.objs;
			objs.dragObj = new $draggable({
				node : elList,
				enableX : conf.direction === 'x',
				enableY : conf.direction === 'y'
			});
			this.set('index', 0);
			this.set('prevIndex', 0);
		},
		setCustEvents : function(action){
			var objs = this.objs;
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			objs.dragObj[action]('dragstart', getBound('checkStyle'));
			objs.dragObj[action]('dragend', getBound('computePos'));
			this[action]('change:index', getBound('checkIndex'));
		},
		resetPos : function(){
			if(!this.delayResetPos){
				this.delayResetPos = $delay(function(){
					var index = this.get('index');
					this.checkStyle();
					this.moveToIndex(index);
				}, 10, this);
			}
			this.delayResetPos();
		},
		checkStyle : function(){
			var conf = this.conf;
			var root = this.role('root');
			var distance = parseInt(root[ conf.direction === 'x' ? 'width' : 'height' ](), 10);
			this.set('distance', distance);
		},
		//根据拖动位置，计算滑动目标
		computePos : function(evt){
			var conf = this.conf;
			var dragData = evt.dragData;
			var distance = this.get('distance');
			var prop = conf.direction;
			var index = this.get('index');
			var delta = {
				x : dragData.deltaX,
				y : dragData.deltaY
			};

			//结合弹性系数判断是否滑动到下一页
			//弹性系数为一个区间为[0,1]的数字，它与单页滑动距离相乘得到弹性范围
			//超过弹性范围的拖动距离，才会引发滑动翻页
			var step = Math.ceil( Math.abs(delta[prop]) / distance);
			if(step > 0){
				step = Math.abs(delta[prop]) % distance > conf.flex * distance ? step : step - 1;
			}

			var nextIndex = delta[prop] < 0 ? index + step : index - step;
			this.setIndex(nextIndex);
			this.slideToIndex(nextIndex);
		},
		setIndex : function(index){
			var prevIndex = this.get('index');
			var elItem = this.role('item');
			index = parseInt(index, 10) || 0;
			index = $limit(index, 0, Math.max(elItem.length - 1, 0));
			if(index !== prevIndex){
				this.set('prevIndex', prevIndex);
				this.set('index', index);
			}
		},
		checkIndex : function(){
			var index = this.get('index');
			this.slideToIndex(index);
		},
		//获取目标序号的translate值
		getTargetTranslate : function(index){
			var conf = this.conf;
			var elItem = this.role('item');
			var pos, translateX, translateY;

			index = parseInt(index, 10) || 0;
			index = $limit(index, 0, Math.max(elItem.length - 1, 0));

			pos = 0 - index * this.get('distance') || 0;
			translateX = conf.direction === 'x' ? pos : 0;
			translateY = conf.direction === 'y' ? pos : 0;
			return {
				translateX : translateX + 'px',
				translateY : translateY + 'px',
				translateZ : 0
			};
		},
		//直接定位到目标序号
		moveToIndex : function(index){
			var elList = this.role('list');
			var translate = this.getTargetTranslate(index);
			elList.transform(translate);
			this.trigger('moveEnd');
		},
		//滑动到目标序号
		slideToIndex : function(index){
			var conf = this.conf;
			var elList = this.role('list');
			var translate = this.getTargetTranslate(index);
			elList.transit(translate, conf.duration, conf.easing, function(){
				this.trigger('transitionEnd');
			}.bind(this));
		}
	});

	module.exports = FlickSlide;

});

