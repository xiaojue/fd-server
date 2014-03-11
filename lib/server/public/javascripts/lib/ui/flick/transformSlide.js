/**
 * @fileoverview transform 拂动变形滑块
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	//root/_html/test/flick-transfrom-slide.html
	//root/js/test/flick/transfromSlide.js
 */
define('lib/ui/flick/transformSlide', function(require,exports,module){

	var $ = require('lib');
	var $module = require('lib/base/module');
	var $slide = require('lib/ui/flick/slide');
	var $limit = require('lib/kit/num/limit');
	var $dragArea = require('lib/ui/drag/area');
	var $transformBox = require('lib/ui/transform/box');
	var $delay = require('lib/kit/func/delay');

	var $parent = $slide.prototype;

	var FlickTransformSlide = $slide.extend({
		options : {
			//根节点
			node : '',
			//弹性系数 [0, 1]
			flex : 0.15,
			//还原之前的transform对象
			restorePrevTransform : true,
			//方向 ['x', 'y']
			direction : 'x',
			//结束动画的时间(ms)
			duration : 300,
			//结束动画的运行方式
			//备选：'cubic-bezier(0, .70, .35, 1)'
			easing : 'ease-out',
			//拖动组件选项
			dragOptions : {
				listenToChild : true
			},
			//变形组件选项
			transformOptions : {
				autoLoadImg : false
			}
		},
		build : function(){
			this.transforms = [];
			this.buildDrag();
			this.buildTransforms();
		},
		setCustEvents : function(action){
			$parent.setCustEvents.apply(this, arguments);
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			this[action]('change:index', getBound('checkTransformBox'));
		},
		resetPos : function(){
			var conf = this.get('conf');
			if(!this.delayResetPos){
				this.delayResetPos = $delay(function(){
					var index = this.get('index');
					//下面的操作顺序不可调换
					//否则iphone上翻转方向后，幻灯定位不准确
					this.checkStyle();
					this.transforms.forEach(function(obj){
						obj.resetPos();
					});
					this.moveToIndex(index);
				}, conf.duration, this);
			}
			this.delayResetPos();
		},
		buildDrag : function(){
			var conf = this.get('conf');
			var elList = this.role('list');
			var objs = this.objs;
			var dragOptions = $.extend({}, conf.dragOptions, {
				node : elList,
				enableX : conf.direction === 'x',
				enableY : conf.direction === 'y'
			});
			objs.dragObj = new $dragArea(dragOptions);
		},
		buildTransforms : function(){
			var conf = this.get('conf');
			var transforms = this.transforms;
			var getBound = this.getBound();
			this.role('transform-box').each(function(index){
				var transformOptions = $.extend({}, conf.transformOptions, {
					node : this
				});
				var obj = new $transformBox(transformOptions);
				transforms.push(obj);
				obj.on('change:busying', getBound('checkDraggable'));
				$(this).data('transform-box', obj);
			});
			this.prepareTransformImg();
		},
		removeTransforms : function(){
			var transforms = this.transforms;
			transforms.forEach(function(obj){
				obj.role('root').data('transform-box', null);
				obj.destroy();
			});
			transforms.length = 0;
		},
		checkTransformBox : function(index){
			var conf = this.get('conf');
			var elItem, elTransform, transformObj;
			var prevIndex = this.get('prevIndex');
			if(conf.restorePrevTransform){
				elItem = this.role('item');
				if(index !== prevIndex){
					elTransform = $(elItem.get(prevIndex)).find('[data-role="transform-box"]');
					transformObj = elTransform.data('transform-box');
					if(transformObj){
						transformObj.restore();
					}
				}
				this.prepareTransformImg(index);
			}
		},
		prepareTransformImg : function(index){
			this.showTransformImg(index);
			this.showTransformImg(index - 1);
			this.showTransformImg(index + 1);
		},
		getTransformObj : function(index){
			var elItem, elTransform, transformObj;
			index = index || this.get('index') || 0;
			elItem = this.role('item');
			elTransform = $(elItem.get(index)).find('[data-role="transform-box"]');
			transformObj = elTransform.data('transform-box');
			return transformObj;
		},
		showTransformImg : function(index){
			var transformObj = this.getTransformObj(index);
			if(transformObj){
				transformObj.loadImg();
			}
		},
		checkDraggable : function(){
			var objs = this.objs;
			var transforms = this.transforms;
			var busying = transforms.some(function(obj){
				return obj.get('busying');
			});
			if(busying){
				objs.dragObj.disable();
			}else{
				objs.dragObj.enable();
			}
		}
	});

	module.exports = FlickTransformSlide;

});

