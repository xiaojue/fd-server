/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('mods/mask',function(require,exports,module){
	var exports = {
		entity:null,
		init : function(){
			this.entity = $('<div></div>');
			this.entity.hide();
			this.entity.addClass('black_overlay');
			$(document.body).append(this.entity);
		},
		show: function(){
			this.entity.show();
		},
		hide: function(){
			this.entity.hide();
		}
	}
	exports.init();
	
    module.exports = exports;
});