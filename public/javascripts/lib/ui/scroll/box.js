/**
 * @fileoverview 滚动盒子 - 可阻止外部滚动
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/ui/scroll/box',function(require,exports,module){

	var $ = require('lib');
	var $view = require('lib/mvc/view');
	var $os = require('lib/kit/env/os');
	var $browser = require('lib/kit/env/browser');
	var $limit = require('lib/kit/num/limit');

	var ScrollBox = $view.extend({
		defaults : {
			stopPropagation : true,
			axis : 'y'
		},
		build : function(){
			var conf = this.conf;
			var root = this.root = this.role('root');
			var mode = this.getMode();
			this.el = this.root.get(0);

			if(mode === 'ios' || mode === 'ios-stop'){
				root.css('overflow-' + conf.axis, 'auto');
				root.css('overflow-scrolling', 'touch');
			}else if(mode === 'bug'){
				root.css('overflow-' + conf.axis, 'hidden');
			}else{
				root.css('overflow-' + conf.axis, 'auto');
			}
		},
		setEvents : function(action){
			var root = this.root;
			var proxy = this.proxy();
			var mode = this.mode;
			this.delegate(action);
			if(mode === 'ios-stop'){
				//针对IOS overflow-scrolling:touch 的处理
				root[action]('touchstart', proxy('scrollingStart'));
				root[action]('touchmove', proxy('scrollingMove'));
			}else if(mode === 'normal'){
				//可以操作scrollTop, scrollLeft的情况
				root[action]('touchmove', proxy('preventDefault'));
				root[action]('touch', proxy('scrollStart'));
				root[action]('drag', proxy('scrollMove'));
			}else if(mode === 'bug'){
				//操作scrollTop, scrollLeft有bug的情况
				//改为操作margin-top, margin-left方式
				root[action]('touchmove', proxy('preventDefault'));
				root[action]('touch', proxy('dragStart'));
				root[action]('drag', proxy('dragMove'));
			}
		},
		//获取运行模式
		getMode : function(){
			var conf = this.conf;
			var stopPropagation = conf.stopPropagation;

			//盒子运行方式
			//为空则为普通模式，不做模拟滚动或者阻止处理
			var mode = '';

			if($browser.MOBILE){
				if($browser.CHROME){
					//chrome的滚动惯性会传播到外面
					if(stopPropagation){
						mode = 'normal';
					}
					//如果不需要停止惯性的传播，则无需处理
				}else if((/ucbrowser/i).test($browser.UA)){
					//UC浏览器支持内部滚动，没有惯性，无需处理
				}else{
					if($os.ios){
						if(parseFloat($os.version) >= 5){
							//IOS 5.0 以上支持 overflow-scrolling:touch
							if(stopPropagation){
								//如需阻止滚动事件传播，需要做特殊处理
								mode = 'ios-stop';
							}else{
								//如果不需要阻止滚动事件传播，则只需要加上 overflow-scrolling:touch 样式即可
								mode = 'ios';
							}
						}else{
							//IOS 5.0 以下不支持overflow:auto区域的原生滚动
							//但可以通过操作scrollTop属性模拟
							mode = 'normal';
						}
					}else if($os.android){
						if(parseFloat($os.version) < 4.1){
							//android 4.1下的浏览器，尤其是该死的小米1S，实现上有bug
							//该浏览器对animation和transform3d的实现都有问题：
							//在滚动的区域中使用了transform3d，或者页面同时存在滚动区域和animation动画
							//会呈现滚动内容飘出原本位置的渲染bug。
							mode = 'bug';
						}else{
							mode ='';
						}
					}
				}
			}else{
				//PC端无需处理
				mode = '';
			}

			this.mode = mode;
			return mode;
		},
		preventDefault : function(evt){
			if(evt){
				evt.preventDefault();
			}
		},
		scrollingStart : function(evt){
			var el = this.el;
			var conf = this.conf;
			var axis = conf.axis;
			var Axis = axis.toUpperCase();
			if(!el){return;}
			evt = evt.originalEvent;
			if(!evt){return;}
			this.allowPrev = axis === 'y' ? (el.scrollTop > 0) : (el.scrollLeft > 0);
			this.allowNext = axis === 'y' ?
				(el.scrollTop < el.scrollHeight - el.clientHeight) :
				(el.scrollLeft < el.scrollWidth - el.clientWidth);
			this.lastPos = evt['page' + Axis];
		},
		scrollingMove : function(evt){
			var conf = this.conf;
			var axis = conf.axis;
			var Axis = axis.toUpperCase();
			evt = evt.originalEvent;
			if(!evt){return;}
			var prev = (evt['page' + Axis] > this.lastPos);
			var next = !prev;
			this.lastPos = evt['page' + Axis];
			if ((prev && this.allowPrev) || (next && this.allowNext)){
				evt.stopPropagation();
			}else{
				evt.preventDefault();
			}
		},
		scrollStart : function(){
			var prop = this.conf.axis === 'y' ? 'scrollTop' : 'scrollLeft';
			this.startPos = this.el[prop];
		},
		scrollMove : function(evt){
			if(!evt.gesture){return;}
			var axis = this.conf.axis;
			var Axis = axis.toUpperCase();
			var prop = axis === 'y' ? 'scrollTop' : 'scrollLeft';
			var spos = this.startPos - evt.gesture['delta' + Axis];
			this.root[prop](spos);
		},
		dragStart : function(evt){
			var root = this.root;
			var el = this.el;
			//root的html有可能被替换，所以每次都需要重新获取
			var scroller = this.scroller = $(root.children().get(0));
			var prop = this.conf.axis === 'y' ? 'margin-top' : 'margin-left';
			this.startPos = parseInt(scroller.css(prop), 10) || 0;
			this.maxPos = prop === 'margin-top' ?
				(scroller.outerHeight() || el.scrollHeight) - root.height() :
				(scroller.outerWidth() || el.scrollWidth) - root.width();
		},
		dragMove : function(evt){
			if(!evt.gesture){return;}
			var root = this.root;
			var axis = this.conf.axis;
			var Axis = axis.toUpperCase();
			var prop = axis === 'y' ? 'margin-top' : 'margin-left';
			var spos = this.startPos + evt.gesture['delta' + Axis];
			spos = $limit(spos, 0 - this.maxPos, 0);
			this.scroller.css(prop, spos + 'px').reflow();
		}
	});

	module.exports = ScrollBox;

});

