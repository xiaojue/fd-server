/**
 * @fileoverview 对话框基本UI
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/ui/dialog',function(require,exports,module){

	var $ = require('lib');
	var $layer = require('lib/ui/layer');
	var $parseDom = require('lib/kit/dom/parseDom');

	//对话框
	var Dialog = $layer.extend({
		options : {
			//对话框模板
			template : '<div><button data-role="ok">ok</button></div>',
			//对话框插入到哪个元素
			parent : null,
			//对话框样式
			styles : {
				'z-index' : 100,
				'position' : 'absolute',
				'display' : 'none'
			}
		},
		parseDom : function(){
			this.nodes = $parseDom(this.conf.template, {
				roles : ['ok', 'cancel']
			});
		},
		setDomEvents : function(action){
			var conf = this.conf;
			var nodes = this.nodes;
			var getBound = this.getBound();
			var delegate = action === 'add' ? 'delegate' : 'undelegate';
			action = action === 'add' ? 'bind' : 'unbind';
			nodes.root[action]('touchmove', getBound('onTouchMove'));
			$(window)[action]('resize', getBound('onResize'));
			nodes.root[delegate]('[data-role="ok"]', 'tap', getBound('ok'));
			nodes.root[delegate]('[data-role="cancel"]', 'tap', getBound('cancel'));
		},
		validate : function(){
			return true;
		},
		ok : function(){
			this.trigger('ok');
			if(this.validate()){
				this.hide();
			}
		},
		cancel : function(){
			this.trigger('cancel');
			this.hide();
		}
	});

	module.exports = Dialog;

});


