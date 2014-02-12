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
    var type, gN, localData, nameLocal, serverLocal, json = {}, flag = 1, serverJson = {}, proxyConfig = {}, s=0, y = 0;
    var gtpl = '', rtpl = '', stpl = '';
    var allnamelist = [];

    var url = "/saveHosts";
    var exports = {
        data :{},
        send :{},
        init : function(){
            // localStorage.removeItem("proxyRule");
            // localStorage.removeItem("serverRule");
            localData = JSON.parse(localStorage.getItem("proxyRule"));
            nameLocal = localStorage.getItem("proxyRuleName");
            if(nameLocal){
                nameLocal = nameLocal.split(',');
            }
            serverLocal = JSON.parse(localStorage.getItem("serverRule"));
            if(window.localStorage && localData && nameLocal){
                //每次进行更新本地代理数据
                this.updateGroupListFunc(localData,nameLocal);
            }
            if(window.localStorage && serverLocal){
                //每次更新本地静态服务数据
                serverJson = serverLocal;
                this.updateServerListFunc(serverLocal);
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
            if(target.getAttribute('editRule')){
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
                var total = $('#groupBtnWrap').find('button').length;
                var dgNum = parseInt(target.getAttribute('deleteGroup'));
                delete json['group' + dgNum];
                for(var item in json){
                    var grN = parseInt(item.replace(/group/g,''));
                    if( grN > dgNum){
                        json['group' + (grN - 1)] = json['group' + grN];
                    }
                }
                if(total > dgNum){
                    delete json['group' + total];
                }
                localStorage.setItem('proxyRule', JSON.stringify(json));
                allnamelist = exports.without(allnamelist,dgNum-1);
                localStorage.setItem('proxyRuleName', allnamelist);
                exports.updateGroupListFunc(json,allnamelist,'d');
            }
            //删除每条规则按钮
            if(target.getAttribute('deleteRule')){
                var arr = target.getAttribute('deleteRule').split('_');
                delete json['group' + arr[0]]['rule' + arr[1]];
                var rNum = $('#group' + arr[0]).find('tr').length;
                for(var item in json['group' + arr[0]]){
                    var rn = parseInt(item.replace(/rule/g,''));
                    if( rn > arr[1]){
                        json['group' + arr[0]]['rule' + (rn-1)] = json['group' + arr[0]]['rule' + rn];
                    }
                }
                delete json['group' + arr[0]]['rule' + (rNum -1)];
                localStorage.setItem('proxyRule', JSON.stringify(json));
                exports.updateGroupListFunc(json, allnamelist);
            }


            //启用代理规则
            if(target.nodeName.toLowerCase() === 'input' && target.checked){
                var proxyNum = target.value.split('_');
                proxyConfig[target.value] = json["group" + proxyNum[0]]["rule" + proxyNum[1]];
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {
                        type : "openProxy",
                        rule :  JSON.stringify(proxyConfig)
                    },
                    success:function(){}
                })
            }
            //取消代理规则
            if(target.nodeName.toLowerCase() === 'input' && !target.checked){
                var cancelNum = target.value.split('_');
                delete proxyConfig[target.value];
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {
                        type : "cancelProxy",
                        rule :  JSON.stringify(proxyConfig)
                    },
                    success:function(){}
                })
            }

        },
        deleteServer : function(event){
            var target = event.target;
            var serverNum = parseInt(target.getAttribute('severrule')); 
            
            if(serverNum){
                exports.send = {};
                serverNum = serverNum -1;
                var total = $('#serverWrap').find('button').length;
                delete serverJson['vhost' + serverNum];
                for(var item in serverJson){
                    var grN = parseInt(item.replace(/vhost/g,''));
                    if( grN > serverNum){
                        serverJson['vhost' + (grN-1)] = serverJson['vhost' + grN];
                    }
                }
                if(serverNum < total-1){
                    delete serverJson['vhost' + (total-1)];
                }
                exports.send.type = "dh";
                exports.send.dh = JSON.stringify(serverJson);
                $.ajax({
                    type: "POST",
                    url: url,
                    data: exports.send,
                    success:function(){
                        console.log('1111');
                    }
                });
                localStorage.setItem('serverRule', JSON.stringify(serverJson));
                exports.updateServerListFunc(serverJson);
            }
            //禁用某条规则
            if(target.getAttribute('disablerule')){
                var el = $(target);
                var itm = parseInt(el.attr("disablerule"));
                if(el.hasClass('btn-info')){
                    el.removeClass('btn-info');
                }else{
                    el.addClass('btn-info');
                    serverJson['vhost' + (itm-1)].push(1);
                }
                localStorage.setItem('serverRule', JSON.stringify(serverJson));
            }
        },
        saveGroupName : function(event){
            if(event.keyCode == 13){
                var target = event.target;
                $(target).attr('disabled','disabled');
                var groupN = $(target).parent().next().attr('editgname');
                $('#groupBtnWrap').find('button')[parseInt(groupN) -1].innerHTML = target.value;
                allnamelist[groupN-1] = target.value;
                localStorage.setItem('proxyRuleName', allnamelist);
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
            exports.send = {};
            exports.send.type = "sh";
            if($('#srcUrl').parent().prev().css('display') != 'none'){
                for(var i in serverJson){
                    if(serverJson[i][0] === exports.data.srcUrl){
                        errSrc.show();
                        errSrc.text("域名重复");
                        return;
                    }
                }
                serverJson['vhost' + (s++)] = [exports.data.srcUrl,exports.data.urlTo];
                var severTpl = ['<tr>'+
                                    '<td>'+ exports.data.srcUrl +'</td>'+
                                    '<td>'+ exports.data.urlTo +'</td>'+
                                    '<td>'+
                                        '<button type="button" class="btn btn-xs btn-info Wpr" severRule = "'+ s +'">delete</button>'+
                                        '<button type="button" class="btn" disableRule = "'+ s +'">disabled</button>'+
                                    '</td>'+
                                '</tr>'].join('');
                // exports.data.num = s.toString();               
                $('#serverWrap').append(severTpl);
                exports.hideDialog();
                localStorage.setItem('serverRule', JSON.stringify(serverJson));
                exports.send.sh = JSON.stringify(serverJson);
                $.ajax({
                    type: "POST",
                    url: url,
                    data: exports.send,
                    success:function(){
                        console.log('1111');
                    }
                });

            }else{
                for(var i in json){
                    for(var j in json[i]){
                        if(json[i][j][0] === exports.data.srcUrl){
                            errSrc.show();
                            errSrc.text("代理规则重复");
                            return;
                        }
                    } 
                }
                exports.hideDialog();
                var item = $('#saveRule').attr("srcEdit");
                if(parseInt(item)){
                    item = item.split('_');
                    //编辑规则的时候，更新json数据
                    json['group' + item[0]]['rule' + item[1]] =[exports.data.srcUrl,exports.data.urlTo];
                    exports.updateGroupListFunc(json, allnamelist);
                }else{
                    if(m != 0){
                        //对已经存在的组添加规则
                        json['group' + type]['rule' + m] =[exports.data.srcUrl,exports.data.urlTo];
                    }else{
                        //此处禁止连续添加新组 而不添加规则
                        //添加新组，添加新的规则 
                        //此处有个bug 删除了一个规则组的所有规则之后，在新添加规则有bug
                        gN = type ? type : i;
                        json['group' + gN]['rule' + m] =[exports.data.srcUrl,exports.data.urlTo];
                    }
                    var ruleTpl = [
                        '<tr>',
                            '<td class="ipt_pl"><input type="checkbox" value="'+ gN + '_' + m +'"></td>',
                            '<td>' + exports.data.srcUrl + '</td>',
                            '<td>' + exports.data.urlTo + '</td>',
                            '<td>',
                                '<button type="button" class="btn btn-xs btn-info Wpr" editRule='+ gN + '_' + m +'>edit</button>',
                                '<button type="button" class="btn btn-xs btn-info" deleteRule='+ gN + '_' + m +'>delete</button>',
                            '</td>',
                        '</tr>'
                    ].join('');
                    //每次修改一个组对其新增规则的时候，在其对应组下添加规则
                    $('#allGroupPanel table').eq(type - 1).append(ruleTpl);
                    $("#saveRule").attr("srcEdit",0);
                }
                localStorage.setItem('proxyRule', JSON.stringify(json));
            }
           
           
        },
        /*更新列表数据*/
        updateGroupListFunc : function(data,name,del){
            gtpl = '';
            rtpl = '';
            for(group in data){
                var groupNum = group.replace(/group/g,'');
                gtpl += '<div class="panel">'+
                            '<div class="panel-heading panel-head clearfix">'+
                                '<span class="groupname"><input type="text" value="'+ name[parseInt(groupNum) -1] +'" class="form-control iptgroup" disabled="disabled"/></span><button type="button" class="btn btn-xs btn-info" editgname = '+ groupNum +'>编辑组名</button> <button type="button" class="btn btn-xs btn-info" deleteGroup = '+ groupNum +'>删除此规则组</button>'+
                            '</div>'+
                            '<div class="panel-body panel-content" id="'+ group +'">'+
                                '<table class="table table-condensed">';
                rtpl += '<button type="button" class="btn btn-success btn_smr" group="'+ groupNum +'">'+ name[parseInt(groupNum) -1] +'</button>';
                z = 0;
                for(rule in data[group]){
                    var ruleCon = data[group][rule];
                    var num = z++;
                    gtpl += '<tr><td class="ipt_pl"><input type="checkbox" value="'+ groupNum + "_" + num +'"></td><td>'+ ruleCon[0] +'</td><td>'+ ruleCon[1] +'</td><td><button type="button" class="btn btn-xs btn-info Wpr" editrule="'+ groupNum + "_" + num +'">edit</button><button type="button" class="btn btn-xs btn-info" deleterule="'+ groupNum + "_" + num +'">delete</button></td></tr>';              
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
            if(!exports.isEmptyObject(localData) && flag){
                for(var s in localData){
                    i++;
                }
                json = localData;
                allnamelist = nameLocal;
                flag = 0;
            }
            if(del && del === 'd'){
                i= i-1;
            }
        },
        updateServerListFunc : function(data){
            stpl = '';
            h=0;
            for(var i in data){
                h++;
                stpl += '<tr>'+
                            '<td>'+ data[i][0] +'</td>'+
                            '<td>'+ data[i][1] +'</td>'+
                            '<td>'+
                                '<button type="button" class="btn btn-xs btn-info Wpr" severRule = "'+ h +'">delete</button>'+
                                '<button type="button" class="btn btn-xs btn-info" disableRule = "'+ h +'">disabled</button>'+
                            '</td>'+
                        '</tr>';
            }
            s = h;
            $('#serverWrap').html(stpl);
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
        },
        addGroupFunc : function(){
            i++;
            json['group' + i] = {};
            //每次创建规则组新增规则m值设置为0
            m = 0;
            var groupTpl = [
                '<div class="panel">',
                    '<div class="panel-heading panel-head clearfix">',
                        '<span class="groupname"><input type="text" value="group' + i + '" class="form-control iptgroup" disabled="disabled" /></span><button type="button" class="btn btn-xs btn-info" editgname = '+ i +'>编辑组名</button> <button type="button" class="btn btn-xs btn-info" deleteGroup = '+ i +'>删除此规则组</button>',
                    '</div>',
                    '<div class="panel-body panel-content" id="group' + i + '">',
                        '<table class="table table-condensed">',    
                        '</table>',
                        '<button type="button" class="btn btn-sm btn-info" ruleBtn='+ i +'>新增规则</button>',
                    '</div>',
                '</div>'
            ].join('');
            $("#allGroupPanel").append(groupTpl);
            var groupBtnTpl = '<button type="button" class="btn btn-success btn_smr" group= '+ i +'>group' + i + '</button>';
            $("#groupBtnWrap").append(groupBtnTpl);
            allnamelist.push('group' + i);
            localStorage.setItem('proxyRuleName', allnamelist);
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
        }
    } 
    exportServer.init();
});
