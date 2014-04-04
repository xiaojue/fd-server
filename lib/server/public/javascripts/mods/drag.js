/**
 * @fileoverview 拖拽组件
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('mods/drag',function(require,exports,module){
	var exports = {
		params:{
			left: 0,
			top: 0,
			currentX: 0,
			currentY: 0,
			flag: false
		},
		getCss : function(o,key){
			return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key]; 	
		},
		drag : function(bar, target, w, h){
			var params = exports.params;
			if(exports.getCss(target, "left") !== "auto"){
				params.left = exports.getCss(target, "left");
			}
			if(exports.getCss(target, "top") !== "auto"){
				params.top = exports.getCss(target, "top");
			}
			//o是移动对象
			bar.onmousedown = function(event){
				params.flag = true;
				document.onselectstart = function(){
	                return false;
	            }
				var e = event;
				params.currentX = e.clientX;
				params.currentY = e.clientY;
			};
			document.onmouseup = function(){
				params.flag = false;	
				if(exports.getCss(target, "left") !== "auto"){
					params.left = exports.getCss(target, "left");
				}
				if(exports.getCss(target, "top") !== "auto"){
					params.top = exports.getCss(target, "top");
				}
			};
			document.onmousemove = function(event){
				var e = event ? event: window.event;
				if(params.flag){
					var nowX = e.clientX, nowY = e.clientY;
					var x =  parseInt(params.left) + nowX - params.currentX;
				    var y =  parseInt(params.top) + nowY - params.currentY;
				    if ( x > 0 &&( x + w < document.documentElement.clientWidth) && y > 0 && (y + h < document.documentElement.clientHeight) ) {
				     	target.style.left = x + "px";
				     	target.style.top = y + "px";
				    }

				}
			}	
		}
	}
    module.exports = exports;
});