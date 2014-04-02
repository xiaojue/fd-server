/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('jobs/proxyGroup',function(require,exports,module){
    var $dialog = require('mods/dialog');
    var pgName = 0;

    var localProxyData, configProxyData, proxySave, srcNode, proxyName, originsrc, originto, oldgroupname;
    var url = '/saveHosts';

    var exports = {
        nodes:{
            srg : $('#setRuleGroup'),
            agw : $("#allgroupwrap"),
            agp : $("#allGroupPanel"),
            gbw : $('#groupBtnWrap')
        },
        init:function(){
            if(scope && scope.localData && scope.configData){
                localProxyData = scope.localData.proxy;
                configProxyData = scope.configData.proxy;
            }
            this.updateGroupListFunc(localProxyData);
            this.bindEvent();
        },
        bindEvent:function(){
            this.nodes.srg.on('click', this.addGroupFunc);
            this.nodes.agp.on('click', this.delegatePanelFunc);
            this.nodes.gbw.on('click', this.showHideHostFunc);
        },
        updateGroupListFunc : function(data){
            if(JSON.stringify(data) === '{}'){
                exports.nodes.agw.hide();
                return;
            }
            exports.nodes.agw.show();
            var gtpl = '';
            var rtpl = '';
            for(group in data){
                gtpl += '<div class="panel">'+
                            '<div class="panel-heading panel-head clearfix">'+
                                '<span class="groupname"><input type="text" value="'+ group +'" class="form-control iptgroup" disabled="disabled" pg="1"/></span>'+
                                // '<button type="button" class="btn btn-xs btn-info" editgname="'+ group +'">编辑组名</button>  '+
                                '<button type="button" class="btn btn-xs btn-info" deletegroup="'+ group +'">删除此规则组</button>'+
                            '</div>'+
                            '<div class="panel-body panel-content" id="'+ group +'">'+
                                '<table class="table table-condensed setmb">';
                rtpl += '<button type="button" class="btn btn-sm btn-success" group="'+ group +'">'+ group +'</button>';
                
                for(var i = 0; i<data[group].length; i++){
                    var check = data[group][i].disabled === true;
                    if(check){
                        gtpl += '<tr>'+
                                    '<td class="ipt_pl"><input type="checkbox" checked></td>'+
                                    '<td>'+ data[group][i].pattern +'</td>'+
                                    '<td>'+ data[group][i].responder +'</td>'+
                                    '<td>'+
                                        '<button type="button" class="btn btn-xs btn-info Wpr" editrule="1">编辑</button>'+
                                        '<button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button>'+
                                    '</td>'+
                                '</tr>';
                    }else{
                        gtpl += '<tr>'+
                                    '<td class="ipt_pl"><input type="checkbox"></td>'+
                                    '<td>'+ data[group][i].pattern +'</td>'+
                                    '<td>'+ data[group][i].responder +'</td>'+
                                    '<td>'+
                                        '<button type="button" class="btn btn-info btn-xs Wpr" editrule="1">编辑</button>'+
                                        '<button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button>'+
                                    '</td>'+
                                '</tr>';
                    }   
                }
                gtpl += '</table>'+
                        '<button type="button" class="btn btn-xs btn-info" rulebtn="1">新增规则</button>'+
                    '</div>'+
                '</div>';  
            }
            exports.nodes.agp.html(gtpl);
            exports.nodes.gbw.html(rtpl);
        },
        addGroupFunc : function(){
            exports.nodes.agw.show();
            pgName++;
            localProxyData['group' + pgName] = [];
            var groupTpl = [
                '<div class="panel">',
                    '<div class="panel-heading panel-head clearfix">',
                        '<span class="groupname"><input type="text" value="group' + pgName + '" class="form-control iptgroup" disabled="disabled" pg="1"/></span>',
                        // '<button type="button" class="btn btn-xs btn-info" editgname = "group' + pgName + '">编辑组名</button> ',
                        '<button type="button" class="btn btn-xs btn-info" deletegroup = "group' + pgName + '">删除此规则组</button>  ',
                    '</div>',
                    '<div class="panel-body panel-content" id="group' + pgName + '">',
                        '<table class="table table-condensed setmb">',    
                        '</table>',
                        '<button type="button" class="btn btn-sm btn-info" ruleBtn='+ pgName +'>新增规则</button>',
                    '</div>',
                '</div>'
            ].join('');
            exports.nodes.agp.append(groupTpl);
            var groupBtnTpl = '<button type="button" class="btn btn-sm btn-success" group="group'+ pgName +'">group' + pgName + '</button>';
            $("#groupBtnWrap").append(groupBtnTpl);
            //本地名字的存储
            exports.requestAjax({
                type : "addGroup",
                ag : JSON.stringify(localProxyData),
                local: "s"
            });
        },
        delegatePanelFunc : function(event){
            var target = event.target;
            //新增规则按钮
            if(target.getAttribute('ruleBtn')){
                proxySave = 'add';
                proxyName = $(target).parent().prev().find('input').val();
                $dialog.init({
                    srcText:'原地址',
                    toText:'代理到',
                    success:exports.saveRuleFunc
                });
                $dialog.show();           
            }
            //编辑规则
            if(target.getAttribute('editrule') && $(target).hasClass("btn-info")){
                srcNode = $(target);
                proxySave = 'edit';
                originsrc = $(target).parent().prev().prev().text();
                originto = $(target).parent().prev().text();
                proxyName = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                $dialog.init({
                    srcText:'原地址',
                    toText:'代理到',
                    success:exports.saveRuleFunc
                });
                $dialog.show('edit',originsrc,originto);  
            }
            //删除规则
            if(target.getAttribute('deleterule') && confirm("确认删除吗？")){
                var responder = $(target).parent().prev().text();
                var pattern = $(target).parent().prev().prev().text();
                proxyName = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                exports.delRuleFunc(localProxyData[proxyName],pattern,responder);
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
                var checkbox = $(target).parent().parent().find("input[type=checkbox]");
                if(checkbox[0].checked){    
                    exports.delRuleFunc(configProxyData,pattern,responder);
                    if(configProxyData.length === 0 ){
                        configProxyData = "1";
                    }
                    exports.requestAjax({
                        type : "cancelProxy",
                        rule : configProxyData
                    });
                }
                $(target).parent().parent().remove();
            }
            //删除规则组
            if(target.getAttribute('deletegroup') && confirm("确定删除吗？")){
                proxyName = target.getAttribute('deletegroup');
                var data = localProxyData[proxyName];
                for(var i = 0; i<data.length; i++){
                    for(var df=0; df<configProxyData.length; df++){
                        if(data[i].pattern === configProxyData[df]["pattern"] && data[i].responder === configProxyData[df]["responder"]){
                            configProxyData.splice(df,1);
                            break;
                        }   
                    }
                }
                delete localProxyData[proxyName];
                //本地缓存的配置文件
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
                if(configProxyData.length === 0 ){
                    configProxyData = "1";
                }
                //若规则组中服务有启动的，则删除规则组的同时关闭服务  
                exports.requestAjax({
                    type : "cancelProxy",
                    rule : configProxyData
                }); 
                $(target).parent().parent().remove(); 
                exports.nodes.gbw.find('button[group="'+ proxyName +'"]').remove();
                var gbw = exports.nodes.gbw;
                var total = gbw.find('button').length;
                if(total === 0){
                    exports.nodes.agw.hide();
                }
            }
            //启用规则
            if(target.getAttribute("type") === "checkbox" && target.checked){
                var responder = $(target).parent().next().next().text();
                var pattern = $(target).parent().next().text();
                proxyName = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                if(exports.repeatRuleFunc(pattern,responder,proxyName)){                 
                    exports.activeDiableRuleFunc(localProxyData,proxyName,pattern,responder,true);
                    configProxyData.push({
                        "pattern": pattern,
                        "responder" : responder
                    });
                    exports.requestAjax({
                        type : "openProxy",
                        rule : configProxyData
                    });
                }
                return;
            }
            //注释规则
            if(target.getAttribute("type") === "checkbox" && !target.checked){
                var responder = $(target).parent().next().next().text();
                var pattern = $(target).parent().next().text();
                proxyName = $(target).parent().parent().parent().parent().parent().prev().find('input').val();             
                exports.activeDiableRuleFunc(localProxyData,proxyName,pattern,responder,false);
                exports.delRuleFunc(configProxyData,pattern,responder);
                if(configProxyData.length === 0 ){
                    configProxyData = "1";
                }
                exports.requestAjax({
                    type : "cancelProxy",
                    rule : configProxyData
                });
                return;
            }
            //编辑组名
            if(target.getAttribute('pg')) {
                $(target).removeAttr('disabled');
                $(target).focus();
                $(target).on('blur',exports.saveHostGroupName);
                oldgroupname = $(target).val();
                return;
            }
        },
        //保存host组的名字
        saveHostGroupName:function(event){
            var target = event.target;
            $(target).attr('disabled','disabled');
            var sendVal = $(target).val();
            if(oldgroupname === sendVal){
                return;
            }
            var groupBtn = exports.nodes.gbw.find('button[group="'+ oldgroupname +'"]');
            groupBtn.text(sendVal);
            groupBtn.attr('group',sendVal);

            var ipt = $(target).parent().next();
            ipt.attr('deletegroup',sendVal);

            $(target).parent().parent().next().attr('id',sendVal);
            if(localProxyData[oldgroupname]){
                localProxyData[sendVal] = localProxyData[oldgroupname];
                delete localProxyData[oldgroupname]
            }
            exports.requestAjax({
                type : "sp",
                sp : JSON.stringify(localProxyData),
                local: "s"
            });
            $(target).unbind('blur'); 
        },
        showHideHostFunc : function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase() === 'button'){
                var na = $(target).attr('group');
                if(target.className === 'btn btn-sm btn-disable'){
                    target.className = 'btn btn-sm btn-success';
                    $('#' + na).show();
                }else{
                    target.className = 'btn btn-sm btn-disable';
                    $('#' + na).hide();
                }
            }
        },
        activeDiableRuleFunc:function(data,groupname,pattern,responder,type){
            for (var i = 0; i < data[groupname].length; i++) {
                var proxy = data[groupname][i];
                if (proxy.pattern == pattern && proxy.responder == responder) {
                    proxy.disabled= type;
                    break;
                }
            }
            exports.requestAjax({
                type : "sp",
                sp : JSON.stringify(data),
                local: "s"
            });
        },
        delRuleFunc:function(data,pattern,responder){
            for (var i = 0; i < data.length; i++) {
                var proxy = data[i];
                if (proxy.pattern == pattern && proxy.responder == responder) {
                    data.splice(i, 1);
                    break;
                }
            }
        },
        repeatRuleFunc:function(pattern,responder){
            var fixed = true;
            for (var i = 0; i < configProxyData.length; i++) {
                var proxy = configProxyData[i];
                if (proxy.pattern == pattern && proxy.responder == responder) {
                    fixed = false;
                    break;
                }
            }
            return fixed;
        },
        editRuleFunc : function(data,originsrc,originto,srcval,toval) {
            for(var i=0; i<data.length; i++){
                if(data[i]['pattern'] === originsrc && data[i]['responder'] === originto){
                    data[i]['pattern'] = srcval;
                    data[i]['responder'] = toval; 
                    break;
                }   
            }
        }, 
        saveRuleFunc:function(srcval,toval,errnode){
            if(proxySave === 'add'){
                localProxyData[proxyName].push({'pattern':srcval,'responder':toval,'disabled':false})
                //本地保存添加规则数据
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
                var ruleTpl = [
                        '<tr>',
                            '<td class="ipt_pl"><input type="checkbox"></td>',
                            '<td>' + srcval + '</td>',
                            '<td>' + toval + '</td>',
                            '<td>',
                                '<button type="button" class="btn btn-xs btn-info Wpr" editrule="1">编辑</button>',
                                '<button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button>',
                            '</td>',
                        '</tr>'
                    ].join('');
                //每次修改一个组对其新增规则的时候，在其对应组下添加规则
                $('#' + proxyName).find('table').append(ruleTpl);
                $dialog.hide();
                return;
            }
            if(proxySave === "edit"){
                //编辑规则的时候判断该规则是否启用 如果启用  要修改配置文件 本地文件  不启用 修改本地文件 
                var arraylist = localProxyData[proxyName];
                exports.editRuleFunc(arraylist,originsrc,originto,srcval,toval);
                //编辑规则的时候，为保证代理顺序 所以此处这么修改
                if(srcNode.parent().parent().find('input[type=checkbox]')[0].checked){
                    exports.editRuleFunc(configProxyData,originsrc,originto,srcval,toval);
                    configProxyData.push({
                        "pattern": srcval,
                        "responder" : toval
                    });
                    exports.requestAjax({
                        type : "openProxy",
                        rule : configProxyData
                    });
                }
                //本地保存修改规则数据
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
                srcNode.parent().prev().prev().text(srcval);
                srcNode.parent().prev().text(toval);
                $dialog.hide();
                return;
            }
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