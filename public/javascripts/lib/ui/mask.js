/**
 * @fileoverview 遮罩基本UI 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/ui/mask',function(require,exports,module){

	var $ = require('lib');
	var $overlay = require('lib/ui/overlay');
	var $parseDom = require('lib/kit/dom/parseDom');
	var $position = require('lib/more/position');

	//遮罩
	var Mask = $overlay.extend({
		options : {
			target : 'screen',			//要遮挡的目标区域
			template : '<div></div>',	//遮罩的模板
			tapHide : false,			//点击/触摸后隐藏
			styles : {					//遮罩的样式
				'z-index' : 100,
				'position' : 'absolute',
				'background' : 'rgba(0,0,0,0.3)',
				'display' : 'none'
			}
		},
		parseDom : function(){
			this.nodes = $parseDom(this.conf.template);
		},
		build : function(){
			this.setStyles();
			this.insert();
		},
		setDomEvents : function(action){
			var conf = this.conf;
			var nodes = this.nodes;
			var getBound = this.getBound();
			action = action === 'add' ? 'bind' : 'unbind';
			nodes.root[action]('touchmove', getBound('onTouchMove'));
			nodes.root[action]('tap', getBound('close'));

			var listen = conf.target === 'screen' ? $(window) : $(conf.target);
			listen[action]('resize', getBound('onResize'));
		},
		onTouchMove : function(evt){
			evt.preventDefault();
		},
		onResize : function(){
			this.setPosition();
		},
		insert : function(){
			var conf = this.conf;
			var nodes = this.nodes;
			var parent = conf.target === 'screen' ? $('body') : $(conf.target).parent();
			nodes.root.appendTo(parent);
		},
		setStyles : function(styles){
			var conf = this.conf;
			var nodes = this.nodes;
			styles = styles || conf.styles || {};
			nodes.root.css(styles);
		},
		setPosition : function(){
			var conf = this.conf;
			var nodes = this.nodes;
			var target = conf.target === 'screen' ? $(window) : $(conf.target);
			$position.pin({
				element : nodes.root,
				x : '0%',
				y : '0%'
			}, {
				element : conf.target === 'screen' ? $position.VIEWPORT : target,
				x : '0%',
				y : '0%'
			});
			var styles = {
				'width' : target.width() + 'px',
				'height' : target.height() + 'px'
			};
			nodes.root.css(styles);
		},
		close : function(){
			var conf = this.conf;
			if(conf.tapHide){
				this.hide();
			}
		}
	});

	module.exports = Mask;

});


