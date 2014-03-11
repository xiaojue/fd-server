/**
 * @fileoverview transform 多点触摸拖动，兼容多种设备
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	//root/_html/test/draggable.html
	//root/js/test/draggable.js
 */
define('lib/ui/draggable',function(require,exports,module){

	var $ = require('lib');
	var $limit = require('lib/kit/num/limit');
	var $module = require('lib/base/module');
	var $getTranslate = require('lib/kit/dom/getTranslate');

	var Draggable = $module.extend({
		options : {
			//要绑定拖动事件的目标元素
			node : '',
			//支持多点触摸拖动
			multiple : false,
			//拖动手柄
			handle : '',
			//允许X方向的拖动
			enableX : true,
			//允许Y方向的拖动
			enableY : true,
			//是否阻止touchmove默认事件
			preventDefault : true
		},
		setDomEvents : function(action){
			var conf = this.get('conf');
			var root = this.role('root');
			var getBound = this.getBound();

			var handle = root;
			if(conf.handle){
				handle = root.find(conf.handle);
			}

			action = action === 'add' ? 'on' : 'off';

			handle[action]('touchstart', getBound('preventDefault'));
			handle[action]('touchmove', getBound('preventDefault'));

			if(conf.multiple){
				handle[action]('touchstart', getBound('checkTouches'));
				handle[action]('touchmove', getBound('checkTouches'));
				handle[action]('touchend', getBound('checkTouches'));

				handle[action]('touch', getBound('checkTouches'));
				handle[action]('drag', getBound('checkTouches'));
				handle[action]('release', getBound('checkTouches'));
			}else{
				handle[action]('dragstart', getBound('checkTouches'));
				handle[action]('drag', getBound('checkTouches'));
				handle[action]('dragend', getBound('checkTouches'));
			}
		},
		setCustEvents : function(action){
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			this[action]('dragstart', getBound('dragStart'));
			this[action]('dragmove', getBound('dragMove'));
			this[action]('dragend', getBound('dragEnd'));
		},
		//阻止touchmove默认事件
		preventDefault : function(evt){
			if(this.conf.preventDefault){
				evt.preventDefault();
			}
		},
		//分离多点触摸事件
		checkTouches : function(evt){
			var that = this;
			var conf = this.get('conf');
			var root = this.role('root');
			var gestureEvent, touches, touchEvent, dragData;

			if(evt.gesture){
				gestureEvent = evt.gesture;
			}else{
				gestureEvent = evt.originalEvent;
			}

			if(conf.multiple){
				touches = gestureEvent.touches;

				if(touches && touches.length){
					touches = [].slice.call(touches);
				}else{
					touches = [gestureEvent];
				}

				touches.forEach(function(tevt, index){
					var dragTarget = $(tevt.target).closest(root).get(0);
					var dragData = {};
					var touchEvent = tevt;

					if(evt.type === 'touchend'){
						dragTarget = root;
					}

					if(dragTarget){
						dragData.pageX = tevt.pageX || evt.pageX;
						dragData.pageY = tevt.pageY || evt.pageY;

						touchEvent.dragTarget = dragTarget;
						touchEvent.dragData = dragData;

						if(evt.type === 'touchmove' || evt.type === 'drag'){
							that.onDrag(touchEvent);
						}else if(evt.type === 'touchend' || evt.type === 'release'){
							that.onEnd(touchEvent);
						}else if(evt.type === 'touchstart' || evt.type === 'touch'){
							that.onStart(touchEvent);
						}
					}
				});
			}else{
				touchEvent = evt;
				touchEvent.dragTarget = $(evt.target).closest(root).get(0);
				touches = gestureEvent.touches;
				if(touches && touches[0]){
					dragData = {};
					dragData.pageX = touches[0].pageX;
					dragData.pageY = touches[0].pageY;
				}
				touchEvent.dragData = dragData;

				if(dragData){
					if(evt.type === 'drag'){
						that.onDrag(touchEvent);
					}else if(evt.type === 'release' || evt.type === 'dragend'){
						that.onEnd(touchEvent);
					}else if(evt.type === 'touch' || evt.type === 'dragstart'){
						that.onStart(touchEvent);
					}
				}
			}
		},
		onStart : function(evt){
			var conf = this.get('conf');
			var root = this.role('root');
			var dragData = evt.dragData || {};
			var storeData = this.get('dragData');
			var startTranslate = $getTranslate(root);

			if(storeData){return;}
			$.extend(dragData, {
				startTranslate : startTranslate,
				startX : dragData.pageX,
				startY : dragData.pageY,
				deltaX : 0,
				deltaY : 0
			});
			this.set('dragData', dragData);

			evt.type = 'dragstart';
			evt.dragData = dragData;
			this.trigger('dragstart', evt);
		},
		onDrag : function(evt){
			var conf = this.get('conf');
			var root = this.role('root');
			var dragData = evt.dragData || {};
			var storeData = this.get('dragData');

			if(!storeData){return;}
			dragData = $.extend(storeData, dragData);
			$.extend(dragData, {
				deltaX : conf.enableX ? dragData.pageX - dragData.startX : 0,
				deltaY : conf.enableY ? dragData.pageY - dragData.startY : 0
			});
			this.set('dragData', dragData);

			evt.type = 'dragmove';
			evt.dragData = dragData;
			this.trigger('dragmove', evt);
		},
		onEnd : function(evt){
			var conf = this.get('conf');
			var root = this.role('root');
			var dragData = evt.dragData || {};
			var storeData = this.get('dragData');

			if(!storeData){return;}
			$.extend(dragData, storeData);
			this.set('dragData', null);

			evt.type = 'dragend';
			evt.dragData = dragData;
			this.trigger('dragend', evt);
		},
		dragStart : $.noop,
		dragMove : function(evt){
			var root = this.role('root');
			var dragData = evt.dragData;
			var startTranslate = dragData.startTranslate;
			root.transform({
				translateX : startTranslate.x + dragData.deltaX + 'px',
				translateY : startTranslate.y + dragData.deltaY + 'px',
				translateZ : 0
			});
		},
		dragEnd : $.noop
	});

	module.exports = Draggable;

});

