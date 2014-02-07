/**
 * @fileoverview 浮层基本UI
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/ui/layer',function(require,exports,module){

	var $ = require('lib');
	var $overlay = require('lib/ui/overlay');
	var $position = require('lib/more/position');

	//浮层
	var Layer = $overlay.extend({
		options : {
			template : '<div></div>',	//浮层模板
			parent : null,				//浮层插入到哪个元素
			styles : {					//浮层样式
				'z-index' : 100,
				'position' : 'absolute',
				'display' : 'none'
			}
		},
		build : function(){
			this.insert();
			this.setStyles();
		},
		setDomEvents : function(action){
			var conf = this.conf;
			var nodes = this.nodes;
			var getBound = this.getBound();
			action = action === 'add' ? 'bind' : 'unbind';
			nodes.root[action]('touchmove', getBound('onTouchMove'));
			$(window)[action]('resize', getBound('onResize'));
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
			var parent = conf.parent ? $(conf.parent) : $('body');
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
			var prevDisplay = nodes.root.css('display');
			nodes.root.css({
				'visibility' : 'hidden',
				'display' : 'block'
			});
			$position.pin({
				element : nodes.root,
				x : '50%',
				y : '50%'
			}, {
				element : conf.parent || $position.VIEWPORT,
				x : '50%',
				y : '50%'
			});
			nodes.root.css({
				'visibility' : '',
				'display' : prevDisplay
			});
		}
	});

	module.exports = Layer;

});


