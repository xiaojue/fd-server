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
    var type, gN, flag = 1, s=0, y = 0, hgname = 0;
    var gtpl = '', rtpl = '', stpl = '', hgtpl = '',hgnametpl = '';
    var allnamelist = [];
    //此变量用来修改名字，存储原来的名字
    var flagname;
    //储存修改后的值
    var srcTarget;

    //修改配置文件存储 重新定义变量
    var configServerData, 
        localServerData, 
        localProxyData, 
        configProxyData, 
        nameProxyData;

    var hostGroupData;

    var url = '/saveHosts', 
        hostGroup = '/hostFile';
    var exports = {
        data :{},
        getNode:{
            dialogT: $('.dialogT'),
            mask: $("#mask"),
            dialogWrap: $("#dialogWrap"),
            srcUrl: $('#srcUrl'),
            urlTo: $('#urlTo'),
            errorTip: $("#errorTip"),
            saveRule : $('#saveRule')
        },
        init : function(){
            var hash = window.location.hash;
            this.switchTab(hash);
            if(scope && scope.localData && scope.configData){
                configServerData = scope.configData.vhost;
                localServerData = scope.localData.vhost;
                localProxyData = scope.localData.proxy;
                configProxyData = scope.configData.proxy;
                nameProxyData = scope.localData.name;
                if(!!nameProxyData){
                    allnamelist = nameProxyData;
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
                // this.updateServerListFunc(scope.localData,scope.configData);
            }
            this.bindEvent();
            this.delegateEvent();
            this.getHostGroup();
        },
        switchTab : function(hash){
            exports.clearDefaultSet();
            if(hash === '#host' || hash === ''){
                $('#switch-tab a').get(0).className = 'current';
                $('#con-wrapper > .container').get(0).style.display='';
            }
            if(hash === '#proxy'){
                $('#switch-tab a').get(1).className = 'current';
                $('#con-wrapper > .container').get(1).style.display='';
            }
            if(hash === '#hostgroup'){
                $('#switch-tab a').get(2).className = 'current';
                $('#con-wrapper > .container').get(2).style.display='';
            }
            $('#switch-tab').on('click',function(event){
                exports.clearDefaultSet();
                var target = event.target;
                target.className = 'current';
                var item = parseInt(target.getAttribute("item"));
                $('#con-wrapper > .container').get(item).style.display='';
            });
        },
        clearDefaultSet : function(){
            $('#switch-tab a').removeClass('current');
            $('#con-wrapper > .container').hide();
        },
        bindEvent : function(){
            $('#setRuleGroup').on('click', this.addGroupFunc);
            $('#creatHostsGroup').on('click', this.addHostGroupFunc)
            exports.getNode.saveRule.on('click', $delay(exports.saveRuleFunc,100));
            $('#cancelRule').on("click", exports.hideDialog);
            $('#closeDialog').on('click', exports.hideDialog);
            $('#staticServer').on('click', function(){exports.showDialog(1,3,0,2)});
        },
        delegateEvent : function(){
            $("#groupBtnWrap").on('click', this.showHidePanelFunc);
            $('#allGroupPanel').on('click', this.newRuleFunc);
            $('#allGroupPanel').on('keyup', this.saveGroupName);
            $('#serverWrap').on('click',this.deleteServer);
            $('#allHostGroupPanel').on('click',this.hostGroupFunc);
            $('#allHostGroupPanel').on('keyup',this.saveGroupName);
        },
        hostGroupFunc : function(event){
            var target = event.target;
            if(target.getAttribute('editgname')) {
                var editName = $(target).prev().find('input');
                editName[0].removeAttribute('disabled');
            }
            //编辑每条规则按钮
            if(target.getAttribute('editRule') && $(target).hasClass("btn-info")){
                exports.showDialog(1,3,0,2)
                exports.getNode.srcUrl.val($(target).parent().prev().prev().text());
                exports.getNode.urlTo.val($(target).parent().prev().text());
                exports.getNode.saveRule.attr("srcEdit",'hg');
                flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                srcTarget = $(target);
            }

            //启用整组host
            if(target.getAttribute('activeGroup') && $(target).hasClass("btn-info")){
                flagname = $(target).parent().find('input').val();
                exports.HostFileAjax({
                    type : 'activeGroup',
                    data : {
                        groupname : flagname
                    }
                });
                $(target).removeClass('btn-info');
                $(target).parent().next().find('input').attr('checked','checked');
                return;
            }
            //禁用整组host
            if(target.getAttribute('activeGroup') && !$(target).hasClass("btn-info")){
                flagname = $(target).parent().find('input').val();
                exports.HostFileAjax({
                    type : 'disableGroup',
                    data : {
                        groupname : flagname
                    }
                });
                $(target).addClass('btn-info');
                $(target).parent().next().find('input').attr('checked',false);
            }

            //删除每条规则的功能
            if(target.getAttribute('deleteRule')){
                if(confirm("确定删除吗？")){
                    var domain = $(target).parent().prev().text();
                    var ip = $(target).parent().prev().prev().text();
                    flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                    exports.HostFileAjax({
                        type : 'deleterule',
                        data : {
                            domain:domain,
                            ip: ip,
                            groupname : flagname
                        }
                    });
                    $(target).parent().parent().remove();
                }
            }
            //删除规则组
            if(target.getAttribute('deletegroup')){
                if(confirm("确定删除吗？")){
                    flagname = $(target).parent().find('input').val();
                    exports.HostFileAjax({
                        type : 'removeGroup',
                        data : {
                            groupname : flagname
                        }
                    });
                    $(target).parent().parent().remove();
                    $('#hostWrap').find('button[group="'+ flagname +'"]').remove();
                    var total = $('#hostWrap').find('button').length;
                    if(total === 0){
                        $('#allHostWrap').hide();
                    }
                }
            }
            //启用规则
            if(target.getAttribute("type") === "checkbox" && target.checked){
                var domain = $(target).parent().next().next().text();
                var ip = $(target).parent().next().text();
                flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val(); 
                exports.HostFileAjax({
                    type : 'activerule',
                    data : {
                        domain:domain,
                        ip: ip,
                        groupname : flagname
                    }
                });
            }

            //注释规则
            if(target.getAttribute("type") === "checkbox" && !target.checked){
                var domain = $(target).parent().next().next().text();
                var ip = $(target).parent().next().text();
                flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val(); 
                exports.HostFileAjax({
                    type : 'disablerule',
                    data : {
                        domain:domain,
                        ip: ip,
                        groupname : flagname
                    }
                });
            }

            //新增规则
            if(target.getAttribute("rulebtn")){
                exports.showDialog(1,3,0,2);
                exports.getNode.saveRule.attr("srcEdit",'name');
                flagname = $(target).parent().prev().find('input').val();
            }
        },
        getHostGroup: function(){
            if(scope && scope.hostData){
                hostGroupData = scope.hostData;
            }
            this.updateHostsGroupFunc(hostGroupData);
        },
        showHidePanelFunc : function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase() === 'button'){
                var num = target.getAttribute('group');
                if(target.className === 'btn btn-sm btn-disable'){
                    target.className = 'btn btn-sm btn-success';
                    $("#group" + num).show();
                }else{
                    target.className = 'btn btn-sm btn-disable';
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
                exports.showDialog(0,2,1,3);
                //获取每个组的规则数
                m = $('#group' + type).find("tr").length;
            }
            //编辑每条规则按钮
            if(target.getAttribute('editRule') && $(target).hasClass("btn-info")){
                exports.showDialog(0,2,1,3);
                exports.getNode.srcUrl.val($(target).parent().prev().prev().text());
                exports.getNode.urlTo.val($(target).parent().prev().text());
                exports.getNode.saveRule.attr("srcEdit", target.getAttribute('editRule'));
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
                    var delgroupitem = [];
                    for(var i in delgroup){
                        for(var df=0; df<configProxyData.length; df++){
                            if(delgroup[i][0] === configProxyData[df]["pattern"]){
                                configProxyData.splice(df,1);
                                break;
                            }   
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
                   
                    
                    if(configProxyData.length === 0 ){
                        configProxyData = "1";
                    }
                    //若规则组中服务有启动的，则删除规则组的同时关闭服务  
                    exports.requestAjax({
                        type : "cancelProxy",
                        rule : configProxyData
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
                    exports.spliceRuleFunc(opendelr);
                    if(configProxyData.length === 0 ){
                        configProxyData = "1";
                    }
                    exports.requestAjax({
                        type : "cancelProxy",
                        rule : configProxyData
                    });
                }
            }
            //启用代理规则
            if(target.nodeName.toLowerCase() === 'input' && target.checked){
                var proxyNum = target.value.split('_');
                var openRule = localProxyData["group" + proxyNum[0]]["rule" + proxyNum[1]];
                if(configProxyData === "1"){
                    configProxyData = [];
                }
                configProxyData.push({
                    "pattern": openRule[0],
                    "responder" : openRule[1]
                });
                exports.requestAjax({
                    type : "openProxy",
                    rule : configProxyData
                });

                var lastchild =  $(target).parent().parent().children().last()[0];
                $(lastchild.children[0]).removeClass('btn-info');
            }
            //取消代理规则
            if(target.getAttribute("type") === "checkbox" && !target.checked){
                var cancelNum = target.value.split('_');
                var cancelRule = localProxyData["group" + cancelNum[0]]["rule" + cancelNum[1]];
                exports.spliceRuleFunc(cancelRule);
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
                if(!$(target).attr('hg')){
                    var groupN = $(target).parent().next().attr('editgname');
                    $('#groupBtnWrap').find('button')[parseInt(groupN) -1].innerHTML = target.value;
                    allnamelist[groupN-1] = target.value;
                    //本地名字的存储
                    exports.requestAjax({
                        type : "sn",
                        sn : allnamelist,
                        local: "s"
                    });
                }else{
                    var ipt = $(target).parent().next();
                    var saveName = ipt.attr('editgname');
                    var sendVal = $(target).val();
                    $('#hostWrap').find('button[group="'+ saveName +'"]').text(sendVal);
                    ipt.attr('editgname',sendVal);
                    ipt.next().attr('deletegroup',sendVal);
                    exports.HostFileAjax({
                        type : "en",
                        data :{
                            oldname : saveName,
                            newname : sendVal
                        } 
                    });   
                } 
            }
        },
        /*对话框保存规则事件*/
        saveRuleFunc : function(){
            var errSrc = exports.getNode.errorTip;
            if(exports.getNode.srcUrl.val() === '' || exports.getNode.urlTo.val() === ''){
                errSrc.show();
                errSrc.text("规则不能为空");
                return;
            }
            
            //唯一性验证
            exports.data.srcUrl = exports.getNode.srcUrl.val();
            exports.data.urlTo  = exports.getNode.urlTo.val();

            if(exports.getNode.saveRule.attr('srcEdit') === "hg"){
                exports.HostFileAjax({
                    type : 'editrule',
                    data : {
                        ip : exports.data.srcUrl,
                        domain : exports.data.urlTo,
                        groupname: flagname
                    }
                });
                srcTarget.parent().prev().prev().text(exports.data.srcUrl);
                srcTarget.parent().prev().text(exports.data.urlTo);
                exports.hideDialog();
                return;
            }

            if(exports.getNode.saveRule.attr('srcEdit') === "name"){
                exports.HostFileAjax({
                    type : 'editrule',
                    data : {
                        ip : exports.data.srcUrl,
                        domain : exports.data.urlTo,
                        groupname: flagname
                    }
                });
                var ruleTpl = [
                    '<tr>',
                        '<td class="ipt_pl"><input type="checkbox"></td>',
                        '<td>' + exports.data.srcUrl + '</td>',
                        '<td>' + exports.data.urlTo + '</td>',
                        '<td>',
                            '<button type="button" class="btn btn-xs btn-info Wpr" editRule="1">编辑</button>',
                            '<button type="button" class="btn btn-xs btn-danger" deleteRule="1">删除</button>',
                        '</td>',
                    '</tr>'
                ].join('');
                $('#defaultGroup table').append(ruleTpl);               
                exports.hideDialog();
                return;
            }

            if(exports.getNode.srcUrl.parent().prev().css('display') != 'none'){
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
                var item = exports.getNode.saveRule.attr("srcEdit");
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
                    exports.getNode.saveRule.attr("srcEdit",0);
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
                rtpl += '<button type="button" class="btn btn-sm btn-success" group="'+ groupNum +'">'+ name[parseInt(groupNum) -1] +'</button>';
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
            exports.getNode.saveRule.attr("srcEdit",0);
            $('#allGroupPanel').html(gtpl);
            $('#groupBtnWrap').html(rtpl);

            //每次刷新页面都要判断是否有本地存储，存储多少项，便于每次新增规则组的时候id的创建
            if(!exports.isEmptyObject(localProxyData) && flag){
                for(var s in localProxyData){
                    i++;
                }
                flag = 0;
            }
            if(del && del === 'd'){
                i= i-1;
            }
        },
        updateHostsGroupFunc: function(data){
            hgtpl = '';
            hgnametpl = '';
            for(name in data){
                hgnametpl += '<button type="button" class="btn btn-sm btn-success" group="'+ name +'">'+ name +'</button>';
                hgtpl += '<div class="panel">'+
                                '<div class="panel-heading panel-head clearfix">'+
                                    '<span class="groupname"><input type="text" value="'+ name +'" class="form-control iptgroup" disabled="disabled" hg="1"/></span>'+
                                    '<button type="button" class="btn btn-xs btn-info" editgname = '+ name +'>编辑组名</button>  '+
                                    '<button type="button" class="btn btn-xs btn-info" deleteGroup = '+ name +'>删除此规则组</button>  '+
                                    '<button type="button" class="btn btn-xs btn-info" activeGroup = '+ name +'>启用整组规则</button> '+
                                '</div>'+
                                '<div class="panel-body panel-content" id="'+ name +'">'+
                                    '<table class="table table-condensed setmb">';

                                    for(var i = 0;i < data[name].length; i++){

                                        var check = data[name][i].disabled === true;
                                        if(check){
                                            hgtpl += '<tr><td class="ipt_pl"><input type="checkbox" value=""></td><td>'+ data[name][i].ip +'</td><td>'+ data[name][i].domain +'</td><td><button type="button" class="btn btn-xs btn-info Wpr" editrule="1">编辑</button><button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button></td></tr>';
                                        }else{
                                            hgtpl += '<tr><td class="ipt_pl"><input type="checkbox" value="" checked></td><td>'+ data[name][i].ip +'</td><td>'+ data[name][i].domain +'</td><td><button type="button" class="btn btn-info btn-xs Wpr" editrule="1">编辑</button><button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button></td></tr>';
                                        }   
                                    }
                                    hgtpl += '</table>'+
                            '<button type="button" class="btn btn-xs btn-info" rulebtn="1">新增规则</button>'+
                        '</div>'+
                    '</div>';     
            }
            $('#allHostWrap').show();
            $('#hostWrap').html(hgnametpl);
            $("#allHostGroupPanel").html(hgtpl);
        },
        requestAjax : function(data){
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                success:function(){}
            });
        },
        HostFileAjax : function(data){
            $.ajax({
                type: "POST",
                url: hostGroup,
                data: data,
                success:function(){}
            });
        },
        hideDialog : function(){
            exports.getNode.mask.hide();
            exports.getNode.dialogWrap.hide();
        },
        showDialog : function(d,q,m,t){
            var getnode = exports.getNode;
            getnode.mask.show();
            getnode.dialogWrap.show();
            getnode.mask.css("width",document.body.scrollWidth);
            getnode.mask.css("height",$(document).height());
            getnode.srcUrl.val('');
            getnode.urlTo.val('');
            getnode.errorTip.hide();
            getnode.dialogT[d].style.display = '';
            getnode.dialogT[q].style.display = '';
            getnode.dialogT[m].style.display = 'none';
            getnode.dialogT[t].style.display = 'none';
        },
        spliceRuleFunc:function(el){
            for(var k=0; k<configProxyData.length; k++){
                if(el[0] === configProxyData[k]["pattern"]){
                    configProxyData.splice(k,1);
                    break;
                }   
            }
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
            var groupBtnTpl = '<button type="button" class="btn btn-sm btn-success" group= '+ i +'>group' + i + '</button>';
            $("#groupBtnWrap").append(groupBtnTpl);
            allnamelist.push('group' + i);
            //本地名字的存储
            exports.requestAjax({
                type : "sn",
                sn : allnamelist,
                local: "s"
            });
        },
        addHostGroupFunc : function(){
            hgname++;
            var hostGroupTpl = [
                '<div class="panel">',
                    '<div class="panel-heading panel-head clearfix">',
                        '<span class="groupname"><input type="text"  hg="1" value="group'+ hgname +'" class="form-control iptgroup" disabled="disabled" /></span>',
                        '<button type="button" class="btn btn-xs btn-info" editgname = "group'+ hgname +'">编辑组名</button>',
                        '<button type="button" class="btn btn-xs btn-info" deleteGroup = "group'+ hgname +'">删除此规则组</button>',
                    '</div>',
                    '<div class="panel-body panel-content">',
                        '<table class="table table-condensed setmb">',    
                        '</table>',
                        '<button type="button" class="btn btn-xs btn-info" rulebtn="1">新增规则</button>',
                    '</div>',
                '</div>'
            ].join('');
            $("#allHostGroupPanel").append(hostGroupTpl);

            var groupBtnTpl = '<button type="button" class="btn btn-sm btn-success" group="group ' + hgname + '">group'+ hgname +'</button>';
            $("#hostWrap").append(groupBtnTpl);
            exports.HostFileAjax({
                type : 'addGroup',
                data : {
                    domain:'group'+ hgname
                }
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
});
