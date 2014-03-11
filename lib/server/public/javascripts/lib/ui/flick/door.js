/**
 * @fileoverview transform 拂动门
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	//root/_html/test/flick-door.html
	//root/js/test/flick/door.js
 */
define('lib/ui/flick/door', function(require,exports,module){

	var $ = require('lib');
	var $module = require('lib/base/module');
	var $limit = require('lib/kit/num/limit');

	var FlickDoor = $module.extend({
		options : {
			//弹性系数 [0, 1]
			flex : 0.25,
			//方向 ['x', 'y']
			direction : 'x',
			//关到哪一边 ['prev', 'next', 'both', 'none']
			side : 'both',
			//是否阻止向另一边移动
			holdSide : true,
			//结束动画的时间(ms)
			duration : 300,
			//动画执行的额外距离
			space : 10,
			//结束动画的运行方式
			easing : 'cubic-bezier(0, .70, .35, 1)'
		},
		build : function(){
			this.set('enable', true);
		},
		setDomEvents : function(action){
			var root = this.role('root');
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			root[action]('touchmove', getBound('preventDefault'));
			root[action]('dragstart', getBound('onStart'));
			root[action]('drag', getBound('onDrag'));
			root[action]('dragend', getBound('onEnd'));
		},
		preventDefault : function(evt){
			if(evt){
				evt.preventDefault();
			}
		},
		//获取起始transform值
		getStartTransform : function(){
			var root = this.role('root');
			var transform = root.transform();
			['X', 'Y', 'Z'].forEach(function(d){
				transform['translate' + d] = parseInt(transform['translate' + d], 10) || 0;
			});
			return transform;
		},
		//格式化transform对象
		fomatTransform : function(transform){
			$.each(transform, function(key, val){
				val = parseInt(val, 10) || 0;
				if(val){
					transform[key] = val + 'px';
				}
			});
			return transform;
		},
		start : function(evDelta){
			if(this.get('transiting')){return;}
			if(!this.get('enable')){return;}
			this.startTransform = this.getStartTransform();
			this.move(evDelta);
			this.trigger('start', this.startTransform, evDelta);
		},
		move : function(evDelta){
			if(this.get('transiting')){return;}
			if(!this.get('enable')){return;}
			if(!this.startTransform){return;}
			var conf = this.get('conf');
			var root = this.role('root');
			var dir = conf.direction.toUpperCase();
			var delta = evDelta['delta' + dir];
			var startTransform = this.startTransform;
			var transform = $.extend({}, startTransform);
			var side = conf.side;
			var holdSide = conf.holdSide;
			if(side === 'prev'){
				delta = delta < 0 ? delta :
					holdSide ? 0 : delta;
			}
			if(side === 'next'){
				delta = delta > 0 ? delta :
					holdSide ? 0 : delta;
			}
			if(side === 'none'){
				delta = holdSide ? 0 : delta;
			}
			transform['translate' + dir] += delta;
			root.transform(this.fomatTransform(transform));
			this.trigger('move', delta, evDelta);
		},
		end : function(evDelta, callback){
			if(this.get('transiting')){return;}
			if(!this.get('enable')){return;}
			if(!this.startTransform){return;}
			var conf = this.get('conf');
			var root = this.role('root');
			var direction = conf.direction;
			var dir = direction.toUpperCase();
			var delta = evDelta['delta' + dir];
			var distance = this.getDistance();
			var edage = conf.flex * distance;
			var transform = {translateZ : 0};

			var pos = this.startTransform['translate' + dir];
			var side = conf.side;
			var overSide = false;
			if(Math.abs(delta) > edage){
				if(side === 'none'){
					overSide = true;
					pos = pos;
				}else{
					if(side !== 'prev'){
						if(delta > 0){
							overSide = true;
						}
						pos = delta > 0 ? pos + distance : pos;
					}
					if(side !== 'next'){
						if(delta < 0){
							overSide = true;
						}
						pos = delta < 0 ? pos - distance : pos;
					}
				}
			}
			var targetTransform = transform['translate' + dir] = pos + 'px';
			var currentTransform = root.transform()['translate' + dir];
			var originalTransform = this.startTransform['translate' + dir];
			currentTransform = parseInt(currentTransform, 10) || 0;
			targetTransform = parseInt(targetTransform, 10) || 0;

			if(originalTransform !== currentTransform || targetTransform !== originalTransform){
				this.transit(transform, overSide, callback);
			}else{
				this.trigger('transitionEnd', overSide);
			}

			this.startTransform = null;
			this.trigger('end', overSide, evDelta);
		},
		//完成最终动画
		transit : function(transform, overSide, callback){
			var conf = this.get('conf');
			var root = this.role('root');
			this.set('transiting', true);
			root.transit(transform, conf.duration, conf.easing, function(){
				this.set('transiting', false);
				this.trigger('transitionEnd', overSide);
				if($.type(callback) === 'function'){
					callback(overSide);
				}
			}.bind(this));
		},
		//前进或者后退一步
		//param {String} stepTo 方向 ['prev', 'next']
		//param {Function} callback 动画完成的回调
		step : function(stepTo, callback){
			var delta = {deltaX:0, deltaY:0};
			var conf = this.get('conf');
			var direction = conf.direction;
			var dir = direction.toUpperCase();
			var distance = this.getDistance();
			if(stepTo === 'prev'){
				delta['delta' + dir] = 0 - distance;
			}else{
				delta['delta' + dir] = distance;
			}
			this.startTransform = this.getStartTransform();
			this.end(delta, callback);
		},
		//获取开关步骤的完整距离
		getDistance : function(){
			var conf = this.get('conf');
			var root = this.role('root');
			var distance = conf.direction === 'x' ?
				root.width() : root.height();
			distance = distance + conf.space;
			return distance;
		},
		getDelta : function(evt){
			if(evt.gesture){
				return {
					deltaX : evt.gesture.deltaX,
					deltaY : evt.gesture.deltaY
				};
			}else{
				return {
					deltaX : 0,
					deltaY : 0
				};
			}
		},
		enable : function(){
			this.set('enable', true);
		},
		disable : function(){
			this.set('enable', false);
		},
		onStart : function(evt){
			if(this.get('transiting')){return;}
			var delta = this.getDelta(evt);
			this.start(delta);
			this.trigger('dragStart', delta);
		},
		onDrag : function(evt){
			if(this.get('transiting')){return;}
			var delta = this.getDelta(evt);
			this.move(delta);
			this.trigger('dragMove', delta);
		},
		onEnd : function(evt){
			if(this.get('transiting')){return;}
			var delta = this.getDelta(evt);
			this.end(delta);
			this.trigger('dragEnd', delta);
		}
	});

	module.exports = FlickDoor;

});

