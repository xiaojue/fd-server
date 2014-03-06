/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('conf/main',function(require,exports,module){
    var $ = require('lib');
    var $delay = require('lib/kit/func/delay');

    /* 代理服务器ui配置界面 */

    var i = 0;
    var j = 0;
    //获取每个组的规则数
    var m = 0;
    //判断服务器配置有几条，便于新添加规则的时候，本地数据的更新
    var h = 0;
    //此值在做模板更新的时候 编辑删除按钮所在组和第几条规则
    //判断是否刷新页面 本地存储数据是否在刷新页面的时候变更 flag=1;
    var z = 0;
    var type, gN, flag = 1, s=0, y = 0;
    var gtpl = '', rtpl = '', stpl = '';
    var allnamelist = [];

    //修改配置文件存储 重新定义变量
    var configServerData, localServerData, localProxyData, configProxyData, nameProxyData, cancelPos;

    var url = '/saveHosts';
    var localUrl = '/localConfig';
    var exports = {
        data :{},
        init : function(){
            if(scope && scope.localData && scope.configData){
                configServerData = scope.configData.vhost;
                localServerData = scope.localData.vhost;
                localProxyData = scope.localData.proxy;
                configProxyData = scope.configData.proxy;
                nameProxyData = scope.localData.name;
                if(!!nameProxyData){
                    allnamelist = nameProxyData;
                }

                if(configProxyData === "[]"){
                    configProxyData = [];
                }
                //此处存储名字有个问题.若用户平频繁的创建规则而不添加组，在渲染组的时候名字会发生错落或者丢失
                if(JSON.stringify(localProxyData) != "{}" && allnamelist.length>0){
                    this.updateGroupListFunc(localProxyData,allnamelist);
                }else{
                    //此处防止不断的创建组，而不添加规则，组名不断的写入配置文件的bug
                    exports.requestAjax({
                        type : "sn",
                        sn : "",
                        local: "s"
                    });
                }
            }
            this.bindEvent();
            this.delegateEvent();
        },
        bindEvent : function(){
            $('#setRuleGroup').on('click', this.addGroupFunc);
            $('#saveRule').on('click', $delay(exports.saveRuleFunc,100));
            $('#cancelRule').on("click", exports.hideDialog);
            $('#closeDialog').on('click', exports.hideDialog);
        },
        delegateEvent : function(){
            $("#groupBtnWrap").on('click', this.showHidePanelFunc);
            $('#allGroupPanel').on('click', this.newRuleFunc);
            $('#allGroupPanel').on('keyup', this.saveGroupName);
            $('#serverWrap').on('click',this.deleteServer)
        },
        showHidePanelFunc : function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase() === 'button'){
                var num = target.getAttribute('group');
                if(target.className === 'btn btn-disable btn_smr'){
                    target.className = 'btn btn-success btn_smr';
                    $("#group" + num).show();
                }else{
                    target.className = 'btn btn-disable btn_smr';
                    $("#group" + num).hide();
                }   
            }
        },
        /*新增规则方法 编辑 删除 规则方法*/
        newRuleFunc : function(event){
            var target = event.target;
            //新增规则按钮
            type = target.getAttribute('ruleBtn');
            //每次点击的新增按钮 都查看是在哪个组下面
            if(type){
                $('#srcUrl').val('');
                $('#urlTo').val('');
                exports.showDialog();
                //获取每个组的规则数
                m = $('#group' + type).find("tr").length;
            }
            //编辑每条规则按钮
            if(target.getAttribute('editRule') && $(target).hasClass("btn-info")){
                exports.showDialog();
                $('#srcUrl').val($(target).parent().prev().prev().text());
                $('#urlTo').val($(target).parent().prev().text());
                $("#saveRule").attr("srcEdit", target.getAttribute('editRule'));
            }
            //编辑组的名字
            if(target.getAttribute('editgname')) {
                var editName = $(target).prev().find('input');
                editName[0].removeAttribute('disabled');
            }
            //删除规则组
            if(target.getAttribute('deleteGroup')){
                if(confirm("确定删除吗？")){
                    var total = $('#groupBtnWrap').find('button').length;
                    var dgNum = parseInt(target.getAttribute('deleteGroup'));
                    var delgroup = localProxyData['group' + dgNum];
                    for(var i in delgroup){
                        if(configProxyData[delgroup[i][0]]){
                            delete configProxyData[delgroup[i][0]];
                        }
                    }
                    delete localProxyData['group' + dgNum];
                    for(var item in localProxyData){
                        var grN = parseInt(item.replace(/group/g,''));
                        if( grN > dgNum){
                            localProxyData['group' + (grN - 1)] = localProxyData['group' + grN];
                        }
                    }
                    if(total > dgNum){
                        delete localProxyData['group' + total];
                    }

                    allnamelist = exports.without(allnamelist,dgNum-1);
                    //本地缓存规则组文件名字的变更配置文件
                    exports.requestAjax({
                        type : "sn",
                        sn : allnamelist,
                        local: "s"
                    });

                    exports.updateGroupListFunc(localProxyData,allnamelist,'d');

                    //本地缓存的配置文件
                    exports.requestAjax({
                        type : "sp",
                        sp : JSON.stringify(localProxyData),
                        local: "s"
                    });

                    //若规则组中服务有启动的，则删除规则组的同时关闭服务  
                    exports.requestAjax({
                        type : "cancelProxy",
                        rule :  JSON.stringify(configProxyData)
                    });  
                    var groupBtnWrap = $("#groupBtnWrap");
                    if(groupBtnWrap.text() === ""){
                        $("#allgroupwrap").hide();
                    }
                }    
            }
            //删除每条规则按钮
            if(target.getAttribute('deleterule') && confirm("确认删除吗？")){
                var arr = target.getAttribute('deleteRule').split('_');
                var opendelr = localProxyData['group' + arr[0]]['rule' + arr[1]];
                delete localProxyData['group' + arr[0]]['rule' + arr[1]];
                var rNum = $('#group' + arr[0]).find('tr').length;
                for(var item in localProxyData['group' + arr[0]]){
                    var rn = parseInt(item.replace(/rule/g,''));
                    if( rn > arr[1]){
                        localProxyData['group' + arr[0]]['rule' + (rn-1)] = localProxyData['group' + arr[0]]['rule' + rn];
                    }
                }
                delete localProxyData['group' + arr[0]]['rule' + (rNum -1)];
                exports.updateGroupListFunc(localProxyData, allnamelist);
                //本地缓存的配置文件
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
                
                var delinput = $(target).parent().siblings().children("input")[0];
                if(delinput.checked){
                    delete configProxyData[opendelr[0]];
                    exports.requestAjax({
                        type : "cancelProxy",
                        rule :  JSON.stringify(configProxyData)
                    });
                }
            }
            //启用代理规则
            if(target.nodeName.toLowerCase() === 'input' && target.checked){
                var proxyNum = target.value.split('_');
                var openRule = localProxyData["group" + proxyNum[0]]["rule" + proxyNum[1]];
                if(configProxyData === "[]" || configProxyData === "1"){
                    configProxyData = [];
                }
                configProxyData.push({
                    "pattern": openRule[0],
                    "responder" : openRule[1]
                });
                // configProxyData[openRule[0]] = openRule[1]; 
                exports.requestAjax({
                    type : "openProxy",
                    rule : configProxyData
                });

                var lastchild =  $(target).parent().parent().children().last()[0];
                $(lastchild.children[0]).removeClass('btn-info');
            }
            //取消代理规则
            if(target.nodeName.toLowerCase() === 'input' && !target.checked){
                var cancelNum = target.value.split('_');
                var cancelRule = localProxyData["group" + cancelNum[0]]["rule" + cancelNum[1]];
                for(var l=0; l<configProxyData.length; l++){
                    if(cancelRule[0] === configProxyData[l]["pattern"]){
                        cancelPos = l;
                        break;
                    }   
                }
                configProxyData.splice(cancelPos,1);
                if(configProxyData.length === 0 ){
                    configProxyData = "1";
                }
                exports.requestAjax({
                    type : "cancelProxy",
                    rule : configProxyData
                });
                var lastchild =  $(target).parent().parent().children().last()[0];
                $(lastchild.children[0]).addClass('btn-info');
            }
        },
        deleteServer : function(event){
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
                
                if($("#serverWrap").text().replace(/\s/g,"") === ""){
                    $("#serverWrap").hide();
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
        saveGroupName : function(event){
            if(event.keyCode == 13){
                var target = event.target;
                $(target).attr('disabled','disabled');
                var groupN = $(target).parent().next().attr('editgname');
                $('#groupBtnWrap').find('button')[parseInt(groupN) -1].innerHTML = target.value;
                allnamelist[groupN-1] = target.value;
                //本地名字的存储
                exports.requestAjax({
                    type : "sn",
                    sn : allnamelist,
                    local: "s"
                });
            }
        },
        verifyRule : function(){
            //域名匹配
            var reg1 =  /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?/g;
            //url匹配
            var reg2 = /^([a-zA-Z]\:)\w/g;
            var reg3 = /^(http|https|ftp)\:/g;

            var text1 = $('#srcUrl').val();
            var text2 = $('#urlTo').val();

            if($('#srcUrl').parent().prev().css('display') != 'none'){
                //服务器配置
                if(reg1.test(text1) && reg2.test(text2)){
                    return true;
                }
                return false;  
            }else{
                //代理配置(全部匹配http的时候有问题)
                if(reg3.test(text1) && (reg2.test(text2)||reg3.test(text2))){
                    return true;
                }
                return false;  
            }
              
        },
        /*对话框保存规则事件*/
        saveRuleFunc : function(from,to){
            var errSrc = $("#errorTip");
            if($('#srcUrl').val() === '' || $('#urlTo').val() === ''){
                errSrc.show();
                errSrc.text("规则不能为空");
                return;
            }
            //输入框规则验证
            // if(!exports.verifyRule()){
            //     errSrc.show();
            //     errSrc.text("输入规则不正确");
            //     return;
            // }

            //唯一性验证
            exports.data.srcUrl = $('#srcUrl').val();
            exports.data.urlTo  = $('#urlTo').val();
            if($('#srcUrl').parent().prev().css('display') != 'none'){
                for(var i in localServerData){
                    if(i === exports.data.srcUrl){
                        errSrc.show();
                        errSrc.text("域名重复");
                        return;
                    }
                }
                
                localServerData[exports.data.srcUrl] = exports.data.urlTo;
                configServerData[exports.data.srcUrl] = exports.data.urlTo;
                var severTpl = ['<tr>'+
                                    '<td>'+ exports.data.srcUrl +'</td>'+
                                    '<td>'+ exports.data.urlTo +'</td>'+
                                    '<td>'+
                                        '<button type="button" class="btn btn-xs btn-danger Wpr" severRule = "'+ exports.data.srcUrl +'">删除</button>'+
                                        '<button type="button" class="btn btn-xs btn-info" disableRule = "'+ exports.data.srcUrl +'">已开启</button>'+
                                    '</td>'+
                                '</tr>'].join(''); 
                $('#serverWrap').show();      
                $('#serverWrap').append(severTpl);
                exports.hideDialog();
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
            }else{
                var item = $('#saveRule').attr("srcEdit");
                if(parseInt(item)){
                    item = item.split('_');
                    //编辑规则的时候，更新json数据 此处排重处理 编辑的 时候禁止和其他项编辑重复
                    var copy = jQuery.extend(true, {}, localProxyData);
                    delete copy['group' + item[0]]['rule' + item[1]];
                    for(var i in copy){
                        for(var j in copy[i]){
                            if(copy[i][j][0] === exports.data.srcUrl){
                                errSrc.show();
                                errSrc.text("代理规则重复");
                                return;
                            }
                        } 
                    }
                    exports.hideDialog();
                    localProxyData['group' + item[0]]['rule' + item[1]] =[exports.data.srcUrl,exports.data.urlTo];
                    exports.updateGroupListFunc(localProxyData, allnamelist);
                }else{
                    for(var i in localProxyData){
                        for(var j in localProxyData[i]){
                            if(localProxyData[i][j][0] === exports.data.srcUrl){
                                errSrc.show();
                                errSrc.text("代理规则重复");
                                return;
                            }
                        } 
                    }
                    exports.hideDialog();
                    if(m != 0){
                        //对已经存在的组添加规则
                        localProxyData['group' + type]['rule' + m] =[exports.data.srcUrl,exports.data.urlTo];
                        gN = type;
                    }else{
                        //此处禁止连续添加新组 而不添加规则
                        //添加新组，添加新的规则 
                        //此处有个bug 删除了一个规则组的所有规则之后，在新添加规则有bug
                        gN = type ? type : i;
                        localProxyData['group' + gN]['rule' + m] =[exports.data.srcUrl,exports.data.urlTo];
                    }
                    var ruleTpl = [
                        '<tr>',
                            '<td class="ipt_pl"><input type="checkbox" value="'+ gN + '_' + m +'"></td>',
                            '<td>' + exports.data.srcUrl + '</td>',
                            '<td>' + exports.data.urlTo + '</td>',
                            '<td>',
                                '<button type="button" class="btn btn-xs btn-info Wpr" editRule='+ gN + '_' + m +'>编辑</button>',
                                '<button type="button" class="btn btn-xs btn-danger" deleteRule='+ gN + '_' + m +'>删除</button>',
                            '</td>',
                        '</tr>'
                    ].join('');
                    //每次修改一个组对其新增规则的时候，在其对应组下添加规则
                    $('#allGroupPanel table').eq(type - 1).append(ruleTpl);
                    $("#saveRule").attr("srcEdit",0);
                }
                //本地缓存的配置文件
                exports.requestAjax({
                    type : "sp",
                    sp : JSON.stringify(localProxyData),
                    local: "s"
                });
            }
        },
        /*更新列表数据*/
        updateGroupListFunc : function(data,name,del){
            $("#allgroupwrap").show();
            gtpl = '';
            rtpl = '';
            var configflag;
            for(group in data){
                var groupNum = group.replace(/group/g,'');
                gtpl += '<div class="panel">'+
                            '<div class="panel-heading panel-head clearfix">'+
                                '<span class="groupname"><input type="text" value="'+ name[parseInt(groupNum) -1] +'" class="form-control iptgroup" disabled="disabled"/></span><button type="button" class="btn btn-xs btn-info" editgname = '+ groupNum +'>编辑组名</button> <button type="button" class="btn btn-xs btn-info" deleteGroup = '+ groupNum +'>删除此规则组</button>'+
                            '</div>'+
                            '<div class="panel-body panel-content" id="'+ group +'">'+
                                '<table class="table table-condensed setmb">';
                rtpl += '<button type="button" class="btn btn-success btn_smr" group="'+ groupNum +'">'+ name[parseInt(groupNum) -1] +'</button>';
                z = 0;
                for(rule in data[group]){
                    var ruleCon = data[group][rule];
                    var num = z++;
                    for(var l=0; l<configProxyData.length; l++){
                        if(ruleCon[0] === configProxyData[l]["pattern"]){
                            configflag = true;
                        }   
                    }
                    if(configProxyData.length > 0 && configflag){ 
                        gtpl += '<tr><td class="ipt_pl"><input type="checkbox" value="'+ groupNum + "_" + num +'" checked="checked"></td><td>'+ ruleCon[0] +'</td><td>'+ ruleCon[1] +'</td><td><button type="button" class="btn btn-xs Wpr" editrule="'+ groupNum + "_" + num +'">编辑</button><button type="button" class="btn btn-xs btn-danger" deleterule="'+ groupNum + "_" + num +'">删除</button></td></tr>';
                        configflag = false;
                    }else{
                        gtpl += '<tr><td class="ipt_pl"><input type="checkbox" value="'+ groupNum + "_" + num +'"></td><td>'+ ruleCon[0] +'</td><td>'+ ruleCon[1] +'</td><td><button type="button" class="btn btn-xs btn-info Wpr" editrule="'+ groupNum + "_" + num +'">编辑</button><button type="button" class="btn btn-xs btn-danger" deleterule="'+ groupNum + "_" + num +'">删除</button></td></tr>';
                    }    
                }
                gtpl += '</table>'+
                        '<button type="button" class="btn btn-xs btn-info" rulebtn="'+ groupNum +'">新增规则</button>'+
                    '</div>'+
                '</div>';  
            }
            $("#saveRule").attr("srcEdit",0);
            $('#allGroupPanel').html(gtpl);
            $('#groupBtnWrap').html(rtpl);

            //每次刷新页面都要判断是否有本地存储，存储多少项，便于每次新增规则组的时候id的创建
            if(!exports.isEmptyObject(localProxyData) && flag){
                for(var s in localProxyData){
                    i++;
                }
                // allnamelist = nameProxyData || [];
                flag = 0;
            }
            if(del && del === 'd'){
                i= i-1;
            }
        },
        // updateServerListFunc : function(data){
        //     stpl = '';
        //     for(var i in data){
        //         stpl += '<tr>'+
        //                     '<td>'+ i +'</td>'+
        //                     '<td>'+ data[i]+'</td>'+
        //                     '<td>'+
        //                         '<button type="button" class="btn btn-xs btn-info Wpr" severRule = "'+ i +'">delete</button>'+
        //                         '<button type="button" class="btn btn-xs btn-info" disableRule = "'+ i +'">disabled</button>'+
        //                     '</td>'+
        //                 '</tr>';
        //     }
        //     $('#serverWrap').html(stpl);
        // },
        requestAjax : function(data){
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success:function(){}
            });
        },
        hideDialog : function(){
            $("#mask").hide();
            $("#dialogWrap").hide();
        },
        showDialog : function(){
            $("#mask").show();
            $("#dialogWrap").show();
            $("#mask").css("width",document.body.scrollWidth);
            $("#mask").css("height",$(document).height());
            $('.dialogT')[0].style.display = '';
            $('.dialogT')[2].style.display = '';
            $('.dialogT')[1].style.display = 'none';
            $('.dialogT')[3].style.display = 'none';
            $("#errorTip").hide();
        },
        addGroupFunc : function(){
            $("#allgroupwrap").show();
            i++;
            localProxyData['group' + i] = {};
            //每次创建规则组新增规则m值设置为0
            m = 0;
            var groupTpl = [
                '<div class="panel">',
                    '<div class="panel-heading panel-head clearfix">',
                        '<span class="groupname"><input type="text" value="group' + i + '" class="form-control iptgroup" disabled="disabled" /></span><button type="button" class="btn btn-xs btn-info" editgname = '+ i +'>编辑组名</button> <button type="button" class="btn btn-xs btn-info" deleteGroup = '+ i +'>删除此规则组</button>',
                    '</div>',
                    '<div class="panel-body panel-content" id="group' + i + '">',
                        '<table class="table table-condensed setmb">',    
                        '</table>',
                        '<button type="button" class="btn btn-sm btn-info" ruleBtn='+ i +'>新增规则</button>',
                    '</div>',
                '</div>'
            ].join('');
            $("#allGroupPanel").append(groupTpl);
            var groupBtnTpl = '<button type="button" class="btn btn-success btn_smr" group= '+ i +'>group' + i + '</button>';
            $("#groupBtnWrap").append(groupBtnTpl);
            allnamelist.push('group' + i);
            //本地名字的存储
            exports.requestAjax({
                type : "sn",
                sn : allnamelist,
                local: "s"
            });
        },
        isEmptyObject : function(obj){
            for(var n in obj){return false} 
            return true; 
        },
        without : function(array,at){
            var arr1 = array.slice(0, at);
            var arr2 = array.slice(at + 1);
            return arr1.concat(arr2)
        }
    }
    exports.init();   
    /* 静态服务器ui配置界面 */

    var exportServer = {
        init : function(){
            $('#staticServer').on('click', this.showDialog);
        },
        showDialog : function(){
            $("#mask").show();
            $("#dialogWrap").show();
            $("#mask").css("width",document.body.scrollWidth);
            $("#mask").css("height",$(document).height());
            $('.dialogT')[0].style.display = 'none';
            $('.dialogT')[2].style.display = 'none';
            $('.dialogT')[1].style.display = '';
            $('.dialogT')[3].style.display = '';
            $('#srcUrl').val('');
            $('#urlTo').val('');
            $("#errorTip").hide();
        }
    } 
    exportServer.init();
});
