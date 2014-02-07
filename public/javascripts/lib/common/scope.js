/**
 * @fileoverview 全局scope对象管理器
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/scope',function(require,exports,module){

	var $model = require('lib/mvc/model');

	var Scope = $model.extend({
		defaults : {
			//全局交互对象的名称
			name : 'scope'
		},
		build : function(){
			this.update();
		},
		update : function(){
			this.set(window[this.conf.name]);
		}
	});

	module.exports = new Scope();
});


