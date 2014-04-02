/**
 * @fileoverview 静态服务器配置文件
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('jobs/vhost',function(require,exports,module){ 
	var $ = require('$');
    var $dialog = require('mods/dialog');
    var mu = require('lib/mustache');
    
    var configServerData, localServerData;
    var url = '/saveHosts';

    var exports = {
        nodes:{
            addBtn : $('#staticServer'),
            serverWrap : $('#serverWrap')
        },
        init:function(){
            if(scope && scope.localData && scope.configData){
                configServerData = scope.configData.vhost;
                localServerData = scope.localData.vhost;
            }
            this.bindEvent();
        },
        bindEvent:function(){
            this.nodes.addBtn.on('click', function(){
                $dialog.init({
                    srcText:'域名',
                    toText:'路径',
                    success:exports.saveRuleFunc
                })
                $dialog.show();
            });
            this.nodes.serverWrap.on('click',this.deleteServerFunc);
        },
        deleteServerFunc : function(event){
            var target = event.target;
            var el = $(target);
            var serverNum = target.getAttribute('severrule'); 
            if(serverNum && confirm("确认删除吗？")){
                delete localServerData[serverNum];
                delete configServerData[serverNum];
                //服务器删除
                exports.requestAjax({
                    type : 'dh',
                    dh : serverNum
                });
                //本地删除
                exports.requestAjax({
                    type : 'dh',
                    dh : serverNum,
                    local : 's'
                });
                el.parent().parent().remove();
                
                if(this.nodes.serverWrap.text().replace(/\s/g,"") === ""){
                    this.nodes.serverWrap.hide();
                }
            }
            //禁用某条规则
            if(target.getAttribute('disablerule')){
                var itm = el.attr("disablerule");
                if(el.hasClass('btn-info')){
                    el.removeClass('btn-info');
                    delete configServerData[itm]
                    //config 移除此项
                    exports.requestAjax({
                        type : "disable",
                        disrule :  itm
                    });
                    el.text("已禁用");
                }else{
                    configServerData[itm] = localServerData[itm]; 
                    //不禁用此项
                    exports.requestAjax({
                        type : "sh",
                        sh :  JSON.stringify(configServerData)
                    });
                    el.addClass('btn-info');
                    el.text("已开启");
                }
            }
        },
        saveRuleFunc:function(srcval,toval,errnode){
            for(var i in localServerData){
                if(i === srcval){
                    errnode.show();
                    errnode.text("域名重复");
                    return;
                }
            }

            localServerData[srcval] = toval;
            configServerData[srcval] = toval;
            var severTpl = ['<tr>'+
                                '<td>'+ srcval +'</td>'+
                                '<td>'+ toval +'</td>'+
                                '<td>'+
                                    '<button type="button" class="btn btn-xs btn-danger Wpr" severRule = "'+ srcval +'">删除</button>'+
                                    '<button type="button" class="btn btn-xs btn-info" disableRule = "'+ toval +'">已开启</button>'+
                                '</td>'+
                            '</tr>'].join(''); 
            exports.nodes.serverWrap.show();      
            exports.nodes.serverWrap.append(severTpl);
            $dialog.hide();

            //本地缓存的配置文件
            exports.requestAjax({
                type : "sh",
                sh : JSON.stringify(localServerData),
                local: "s"
            });
            //启用代理的配置文件
            exports.requestAjax({
                type : "sh",
                sh : JSON.stringify(configServerData)
            });
        },
        requestAjax : function(data){
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success:function(){}
            });
        }
    }

    exports.init();
});
