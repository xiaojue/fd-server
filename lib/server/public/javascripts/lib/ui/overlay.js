/**
 * @fileoverview 覆盖物基本UI
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/ui/overlay',function(require,exports,module){

	var $ = require('lib');
	var $base = require('lib/base/base');
	var $parseDom = require('lib/kit/dom/parseDom');

	//覆盖物类
	var Overlay = $base.extend({
		options : {
			template : null
		},
		parseDom : function(){
			this.nodes = $parseDom(this.conf.template);
		},
		setPosition : $.noop,
		show : function(){
			this.setPosition();
			this.nodes.root.show();
			this.set('visible', true);
			this.trigger('show');
		},
		hide : function(){
			this.nodes.root.hide();
			this.set('visible', false);
			this.trigger('hide');
		}
	});

	module.exports = Overlay;

});


