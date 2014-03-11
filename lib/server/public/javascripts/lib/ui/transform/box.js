/**
 * @fileoverview transform 可变形图片盒子
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @example
	//root/_html/test/transform-box.html
	//root/js/test/transform/box.js
 */
define('lib/ui/transform/box', function(require,exports,module){

	var $ = require('lib');
	var $module = require('lib/base/module');
	var $dragArea = require('lib/ui/drag/area');
	var $getCoordinates = require('lib/kit/dom/getCoordinates');
	var $getTranslate = require('lib/kit/dom/getTranslate');
	var $limit = require('lib/kit/num/limit');
	var $delay = require('lib/kit/func/delay');

	var TransformBox = $module.extend({
		options : {
			//根节点
			node : '',
			//可拖动范围区域元素
			area : '',
			//结束动画的时间(ms)
			duration : 300,
			//结束动画的运行方式
			easing : 'ease-in',
			//是否允许缩放
			scale : true,
			//是否允许旋转
			rotate : false,
			//缓存角色元素
			cacheRole : true,
			//自动计算图片宽度
			autoWidth : true,
			//自动计算图片高度
			autoHeight : true,
			//最大缩放范围，0为自动
			scaleRangeMax : 0,
			//最小缩放范围，0为自动
			scaleRangeMin : 0,
			//自动加载图片
			autoLoadImg : true,
			//拖动选项
			dragOptions : {
				disableOverflowX : 'inside',
				disableOverflowY : 'inside'
			}
		},
		build : function(){
			var conf = this.get('conf');
			var root = this.role('root');
			var elArea = conf.area || root;
			this.nodes.area = elArea;
			var elTransform = this.role('transform');
			var objs = this.objs;
			var dragOptions = $.extend({}, conf.dragOptions, {
				node : elTransform,
				area : elArea
			});
			root.css({
				//这两个样式用于解决闪屏问题
				'backface-visibility' : 'hidden',
				'transform-style' : 'preserve-3d'
			});
			objs.dragObj = new $dragArea(dragOptions);
			this.set('disableScale', !conf.scale);
			this.set('disableRotate', !conf.rotate);
			this.checkStyle();
		},
		setDomEvents : function(action){
			var root = this.role('root');
			var getBound = this.getBound();
			var delegate = action === 'add' ? 'delegate' : 'undelegate';
			action = action === 'add' ? 'on' : 'off';
			root[action]('touchmove', getBound('preventDefault'));
			root[delegate]('[data-role="transform"]', 'transformstart', getBound('start'));
			root[delegate]('[data-role="transform"]', 'transform', getBound('transform'));
			root[delegate]('[data-role="transform"]', 'transformend', getBound('end'));
			root[delegate]('[data-role="transform"]', 'release', getBound('end'));
			root[delegate]('[data-role="transform"]', 'hold', getBound('activeRotate'));
			root[delegate]('[data-role="transform"]', 'doubletap', getBound('toggleScale'));
		},
		setCustEvents : function(action){
			var objs = this.objs;
			var getBound = this.getBound();
			action = action === 'add' ? 'on' : 'off';
			objs.dragObj[action]('start', getBound('onMoveStart'));
			objs.dragObj[action]('move', getBound('onMove'));
			objs.dragObj[action]('end', getBound('onMoveEnd'));
			this[action]('change:transiting', getBound('checkDraggable'));
			this[action]('change:transforming', getBound('checkDraggable'));
		},
		preventDefault : function(evt){
			if(evt){
				evt.preventDefault();
			}
		},
		resetPos : function(){
			var size = this.get('imgSize');
			if(size){
				this.checkImgStyles();
				this.computeRange();
				this.limitView({
					transit : false
				});
			}
		},
		onMove : function(){
			if(!this.get('busying')){
				this.set('dragging', true);
			}
		},
		onMoveEnd : function(){
			this.set('dragging', false);
		},
		checkStyle : function(){
			var conf = this.get('conf');
			var root = this.role('root');
			var elTransform = this.role('transform');
			var transform = {
				//先偏移1个像素，这样旋转后再拖动时
				//计算偏移量时可以不考虑旋转的影响
				//这个机制应该与transform值到matrix的映射有关
				translateX : '1px',
				translateY : '1px'
			};
			//需要预先设置transform-origin
			//避免拖动到x:0,y:0时再旋转导致偏移量计算需要考虑rotate
			elTransform.css({
				'opacity' : 0,
				'transform-origin' : '50% 50%'
			}).transform(transform);

			if(conf.autoLoadImg){
				this.loadImg();
			}
		},
		loadImg : function(){
			var conf = this.get('conf');
			var elTransform = this.role('transform');
			var img;
			var src = elTransform.attr('data-src');
			if(src){
				img = new Image();
				img.onload = function(){
					if(!this.get('attached')){return;}
					var size = {
						width : img.width,
						height : img.height
					};
					this.set('imgSize', size);
					elTransform.attr('src', src);
					this.checkImgStyles();
					elTransform.transform({
						translateX : '0px',
						translateY : '0px'
					}).transit({
						'opacity' : 1
					}, conf.duration, conf.easing);
					elTransform.attr('data-src', '');
					this.computeRange();
				}.bind(this);
				img.src = src;
			}
		},
		checkImgStyles : function(){
			var elTransform = this.role('transform');
			var conf = this.get('conf');
			var size = this.get('imgSize');
			var parentNode = elTransform.parent();
			var width = size.width;
			var height = size.height;
			var scale = width / height;
			var areaWidth = parentNode.width();
			var areaHeight = parentNode.height();
			var marginLeft = 0;
			var marginTop = 0;

			if(conf.autoWidth && width > areaWidth){
				width = areaWidth;
				height = width / scale;
			}
			if(conf.autoHeight && height > areaHeight){
				height = areaHeight;
				width = scale * height;
			}
			marginLeft = (areaWidth - width) / 2;
			marginTop = (areaHeight - height) / 2;

			parentNode.css({
				'position' : 'relative'
			});

			elTransform.css({
				'position' : 'absolute',
				'display' : 'block',
				'user-select' : 'none',
				'user-drag' : 'none',
				'left' : marginLeft + 'px',
				'top' : marginTop + 'px',
				'width' : width + 'px',
				'height' : height + 'px'
			});
		},
		//检查变形边界
		computeRange : function(){
			var size = this.get('imgSize');
			var conf = this.get('conf');
			var elTransform = this.role('transform');
			var maxScale = conf.scaleRangeMax;

			if(conf.scaleRangeMin){
				this.set('scaleRangeMin', conf.scaleRangeMin);
			}else{
				this.set('scaleRangeMin', 1);
			}
			if(conf.scaleRangeMax){
				this.set('scaleRangeMax', conf.scaleRangeMax);
			}else{
				maxScale = Math.max(2, size.width / elTransform.width());
				this.set('scaleRangeMax', maxScale);
			}
		},
		//检查是否可以拖动
		checkDraggable : function(){
			var objs = this.objs;
			var transforming = this.get('transforming');
			var transiting = this.get('transiting');
			if(transiting || transforming){
				this.set('busying', true);
				objs.dragObj.disable();
			}else{
				this.set('busying', false);
				objs.dragObj.enable();
			}
		},
		//激活旋转状态
		activeRotate : function(){
			this.set('rotateable', true);
		},
		//还原旋转状态
		restoreRotate : function(){
			this.set('rotateable', false);
		},
		//启用缩放
		enableScale : function(){
			this.set('disableScale', false);
		},
		//禁用缩放
		disableScale : function(){
			this.set('disableScale', true);
		},
		//启用旋转
		enableRotate : function(){
			this.set('disableRotate', false);
		},
		//禁用旋转
		disableRotate : function(){
			this.set('disableRotate', true);
		},
		//还原为初始状态
		restore : function(){
			var objs = this.objs;
			var conf = this.get('conf');
			var elTransform = this.role('transform');
			var transform = {
				translateX : '0px',
				translateY : '0px',
				scale : 1,
				rotate : '0deg'
			};

			objs.dragObj.resetRange();
			this.set('currentScale', 1);

			this.set('transiting', true);

			//下面这行用于确保动画被执行
			transform.translateZ = Math.random() + 'px';
			elTransform.transit(transform, conf.duration, conf.easing, function(){
				this.set('transiting', false);
			}.bind(this));
		},
		//切换缩放
		toggleScale : function(){
			if(this.get('transiting')){return;}
			var conf = this.get('conf');
			var objs = this.objs;
			var elTransform = this.role('transform');
			var transform = elTransform.transform();
			var maxScale = this.get('scaleRangeMax');
			var minScale = this.get('scaleRangeMin');
			var scale = parseFloat(transform.scale, 10) || 1;
			var targetScale = maxScale;
			if(scale >= targetScale){
				targetScale = minScale;
			}
			if(!this.get('disableScale') && scale != targetScale){
				transform.scale = targetScale;
				this.set('transiting', true);
				elTransform.transit(transform, conf.duration, conf.easing, function(){
					this.set('currentScale', targetScale);
					this.limitView();
				}.bind(this));
			}
		},
		//限制视口
		limitView : function(spec){
			this.objs.dragObj.resetRange();
			this.set('dragging', false);
			this.set('transiting', false);
			this.set('transformed', true);
			this.end(spec);
		},
		//变形开始
		start : function(){
			if(this.get('dragging')){return;}
			if(this.get('transiting')){return;}
			var elTransform = this.role('transform');
			var transform = elTransform.transform();
			var rotate = parseFloat(transform.rotate, 10) || 0;
			var scale = parseFloat(transform.scale, 10) || 1;
			this.set('startRotate', rotate);
			this.set('startScale', scale);
			this.set('transforming', true);
		},
		//变形进行中
		transform : function(evt){
			if(this.get('dragging')){return;}
			if(this.get('transiting')){return;}
			this.set('transforming', true);
			var rotation, scale;
			var startRotate = this.get('startRotate');
			var startScale = this.get('startScale');
			var elTransform = this.role('transform');

			this.set('transformed', true);

			if(evt && evt.gesture){
				rotation = evt.gesture.rotation;
				scale = evt.gesture.scale;
			}
			this.set('deltaRotation', rotation);
			rotation = rotation + startRotate;
			scale = scale * startScale;
			this.set('currentScale', scale);

			var transform = {};
			if(!this.get('disableScale')){
				transform.scale = scale;
			}
			if(!this.get('disableRotate') && this.get('rotateable')){
				transform.rotate = rotation + 'deg';
			}
			elTransform.transform(transform);
		},
		//变形结束
		end : function(spec){
			if(this.get('dragging')){return;}
			if(this.get('transiting')){return;}
			if(!this.get('transformed')){return;}
			this.set('transformed', false);

			var conf = this.get('conf');
			var root = this.role('root');
			var objs = this.objs;
			var elArea = conf.area || root;
			var elTransform = this.role('transform');
			var transform = elTransform.transform();
			var deltaRotation = this.get('deltaRotation');
			var startRotate = this.get('startRotate');
			var coordinates = $getCoordinates(elTransform);
			var areaCoordinates = $getCoordinates(elArea);
			var rotate, dir, rotation, scale;

			spec = $.extend({
				transit : true
			}, spec);

			this.set('startRotate', null);

			if(!this.get('disableRotate') && this.get('rotateable')){
				rotate = parseFloat(transform.rotate, 10) || 0;
				dir = deltaRotation > 0 ? Math.ceil(rotate / 90) : Math.floor(rotate / 90);
				rotation = 90 * dir;
				transform.rotate = rotation + 'deg';
			}

			if(!this.get('disableScale')){
				scale = this.get('currentScale');
				transform.scale = $limit(scale, this.get('scaleRangeMin'), this.get('scaleRangeMax'));
				this.set('currentScale', transform.scale);
			}

			objs.dragObj.resetRange();
			var translate = $getTranslate(elTransform);
			var pos = objs.dragObj.limit(translate);
			transform.translateX = pos.x + 'px';
			transform.translateY = pos.y + 'px';

			if(coordinates.width <= areaCoordinates.width || coordinates.height <= areaCoordinates.height){
				transform.translateX = '0px';
				transform.translateY = '0px';
			}

			//下面这行用于确保动画被执行
			transform.translateZ = Math.random() + 'px';

			if(spec.transit){
				this.set('transiting', true);
				elTransform.transit(transform, conf.duration, conf.easing, function(){
					if(dir){
						dir = dir % 4;
						elTransform.transform({
							rotate : 90 * dir
						});
					}
					this.restoreRotate();
					objs.dragObj.resetRange();
					this.set('transiting', false);
				}.bind(this));
			}else{
				elTransform.transform(transform);
				objs.dragObj.resetRange();
			}
			this.set('transforming', false);
		}
	});

	module.exports = TransformBox;

});

