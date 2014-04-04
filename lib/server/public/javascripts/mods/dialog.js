/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */

define('mods/dialog',function(require,exports,module){
	var $mask = require('mods/mask');
	var $drag = require('mods/drag');
	var flag = 1;
    var exports = {
		entity:null,
		tpl:'<div class="dialogOuter" id="dialogWrap" style="display:none;">' +
			    '<span class="dialogClose" id="closeDialog">关闭</span>' +
			    '<div class="dialogBox">' +
			        '<div class="dialogTitle" id="dialogTitle">添加配置规则</div>' +
			        '<div class="dialogInner">' +
			            '<div class="dialogC">' +
			                '<span class="errorTips" style="display:none;" id="errorTip"></span>' +
			                '<div class="dialogU">' +
			                    '<label class="dialogT" for="srcUrl"></label>' +
			                    '<div class="dialogB"><textarea id="srcUrl" class="form-control" rows="3"></textarea></div>' +
			                '</div>' +
			                '<div class="dialogU">' +
			                    '<label class="dialogT" for="urlTo"></label>' +
			                    '<div class="dialogB"><textarea id="urlTo" class="form-control" rows="3"></textarea></div>' +
			                '</div>' +
			            '</div>' +
			            '<div class="dialogF">' +
			                '<button type="button" class="btn btn-xs btn-info" id="saveRule">保存</button> &nbsp; &nbsp; &nbsp;' +
			                '<button type="button" class="btn btn-xs btn-info" id="cancelRule">取消</button>' +
			            '</div>' +
			        '</div>' +
			    '</div>' +
			'</div>',
		options : {},
		nodes: {},
		init : function(opt){
			flag++;
			this.options = {
				srcText:opt.srcText || '',
				toText:opt.toText || '',
				success: opt.success || function(){}
			}
			if(flag===2){
				$(document.body).append(this.tpl);
				this.entity = $('#dialogWrap');
				this.nodes.srcUrl = $('#srcUrl');
				this.nodes.urlTo = $('#urlTo');
				this.nodes.errorTip = $('#errorTip');
				this.nodes.srcUrl.parent().prev().text(this.options.srcText);
				this.nodes.urlTo.parent().prev().text(this.options.toText);
				this.middle(this.entity[0],460,360);
				this.bindEvent();
			}else{
				this.nodes.srcUrl.parent().prev().text(this.options.srcText);
				this.nodes.urlTo.parent().prev().text(this.options.toText);
			}	
		},
		middle:function(el,w,h) {
			el.style.top = (document.documentElement.clientHeight - h)/2 + 'px';
			el.style.left = (document.documentElement.clientWidth - w)/2 + 'px';
			el.style.width = w + 'px';
			el.style.height = h + 'px';
		},
		bindEvent:function(){
			var that = this;
			$drag.drag($('#dialogTitle')[0], $('#dialogWrap')[0], 460, 360);
			$('#saveRule').on('click',function(){
				if(that.nodes.srcUrl.val() != '' && that.nodes.urlTo.val() != ''){
					that.options.success.call(null, $.trim(that.nodes.srcUrl.val()), $.trim(that.nodes.urlTo.val()), that.nodes.errorTip);
				}else{
					that.nodes.errorTip.show();
					that.nodes.errorTip.text('规则不能为空');
				}	
			});
			$('#cancelRule').on('click',function(){
				exports.hide();
			});
			$('#closeDialog').on('click',function(){
				exports.hide();
			});	
		},
		show: function(type,src,to){
			if(type && type === 'edit'){
				this.nodes.srcUrl.val(src);
				this.nodes.urlTo.val(to);
			}
			this.entity.show();
			$mask.show();
		},
		hide: function(){
			this.nodes.srcUrl.val('');
			this.nodes.urlTo.val('');
			this.nodes.errorTip.hide();
			this.entity.hide();
			$mask.hide();
		}
	}
    module.exports = exports;
});