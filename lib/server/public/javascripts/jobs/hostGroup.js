/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('jobs/hostGroup',function(require,exports,module){
	var $ = require('$');
    var $dialog = require('mods/dialog');
    var mu = require('lib/mustache');

    var hostGroupData, flagname, flagSave, srcTarget,hgname = 0, oldgroupname;
    var hostGroup = '/hostFile';

    var utils = {
        getItemName:function(data){
            var ret ={
                groupname :[]
            }
            for(var i in data){
                ret.groupname.push({'name': i})
            }
            return ret;
        }
    }
    var exports = {
        nodes:{
        	ahw: $('#allHostWrap'),
        	hw: $('#hostWrap'),
        	ahgp: $("#allHostGroupPanel"),
        	chg: $('#creatHostsGroup')
        },
        btntpl :'{{#groupname}}<button type="button" class="btn btn-sm btn-success mr" group="{{name}}">{{name}}</button>{{/groupname}}',  
        init:function(){
            this.getHostGroup();
            this.bindEvent();
        },
        bindEvent:function() {
            exports.nodes.chg.on('click', this.addHostGroupFunc);
            exports.nodes.ahgp.on('click',this.hostGroupFunc);
            exports.nodes.hw.on('click',this.showHideHostFunc);
        },
        hostGroupFunc:function(event){
            var target = event.target;
            //编辑组名
            if(target.getAttribute('hg')) {
                $(target).removeAttr('disabled');
                $(target).focus();
                $(target).on('blur',exports.saveHostGroupName);
                oldgroupname = $(target).val();
                return;
            }
            // 编辑每条规则按钮
            if(target.getAttribute('editRule')){
                flagSave = 'editrule';
                flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val();
                srcTarget = $(target);
                var src = $(target).parent().prev().prev().text();
                var to = $(target).parent().prev().text();
                $dialog.init({
                    srcText:'IP',
                    toText:'域名',
                    success:exports.saveRuleFunc
                });
                $dialog.show('edit',src,to);
                return;
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
                $(target).parent().next().find('input').prop('checked',true);
                return;
            }
            // 禁用整组host
            if(target.getAttribute('activeGroup') && !$(target).hasClass("btn-info")){
                flagname = $(target).parent().find('input').val();
                exports.HostFileAjax({
                    type : 'disableGroup',
                    data : {
                        groupname : flagname
                    }
                });
                $(target).addClass('btn-info');
                $(target).parent().next().find('input').prop('checked',false);
                return;
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
                    exports.nodes.hw.find('button[group="'+ flagname +'"]').remove();
                    var total = exports.nodes.hw.find('button').length;
                    if(total === 0){
                        exports.nodes.ahw.hide();
                    }
                }
            }
            //启用规则
            if(target.getAttribute("type") === "checkbox" && target.checked){
                exports.activeDsiableRuleFunc(target,'activerule');
            }

            //注释规则
            if(target.getAttribute("type") === "checkbox" && !target.checked){
                exports.activeDsiableRuleFunc(target,'disablerule');
            }
            //新增规则
            if(target.getAttribute("rulebtn")){
                flagSave = 'addrule';
                flagname = $(target).parent().prev().find('input').val();
                $dialog.init({
                    srcText:'IP',
                    toText:'域名',
                    success:exports.saveRuleFunc
                });
                $dialog.show();
            }
        },
        //激活启用规则组函数
        activeDsiableRuleFunc:function(target,type) {
            var domain = $(target).parent().next().next().text();
            var ip = $(target).parent().next().text();
            flagname = $(target).parent().parent().parent().parent().parent().prev().find('input').val(); 
            exports.HostFileAjax({
                type : type,
                data : {
                    domain:domain,
                    ip: ip,
                    groupname : flagname
                }
            });
        },
        //添加规则，编辑规则保存函数
        saveRuleFunc:function(srcval,toval,errnode){
            if(flagSave === "addrule"){
                exports.HostFileAjax({
                    type : 'editrule',
                    data : {
                        ip : srcval,
                        domain : toval,
                        groupname: flagname
                    }
                });
                var ruleTpl = [
                    '<tr>',
                        '<td class="ipt_pl"><input type="checkbox" checked></td>',
                        '<td>' + srcval + '</td>',
                        '<td>' + toval + '</td>',
                        '<td>',
                            '<button type="button" class="btn btn-xs btn-info Wpr" editRule="1">编辑</button>',
                            '<button type="button" class="btn btn-xs btn-danger" deleteRule="1">删除</button>',
                        '</td>',
                    '</tr>'
                ].join('');
                $('#'+flagname).find('table').append(ruleTpl);               
                $dialog.hide();
                return;
            }

            if(flagSave === 'editrule'){
                exports.HostFileAjax({
                    type : 'editrule',
                    data : {
                        ip : srcval,
                        domain : toval,
                        groupname: flagname
                    }
                });
                srcTarget.parent().prev().prev().text(srcval);
                srcTarget.parent().prev().text(toval);
                $dialog.hide();
                return;
            }
        },
        //保存host组的名字
        saveHostGroupName:function(event){
            var fixed = false;
            var gname = [];
            for(var i in hostGroupData){
                gname.push(i);
            }

            var target = event.target;
            $(target).attr('disabled','disabled');
            var sendVal = $(target).val();
             //此处循环 防止名字重复
            for(var i=0; i<gname.length; i++){
                if(gname[i] === sendVal){
                    fixed = true;
                }
            }
            if(oldgroupname === sendVal){
                return;
            }
            if(!fixed){
                var groupBtn = exports.nodes.hw.find('button[group="'+ oldgroupname +'"]');
                groupBtn.text(sendVal);
                groupBtn.attr('group',sendVal);

                var ipt = $(target).parent().next();
                ipt.attr('deletegroup',sendVal);
                $(target).parent().parent().next().attr('id',sendVal);
                exports.HostFileAjax({
                    type : "en",
                    data :{
                        oldname : oldgroupname,
                        newname : sendVal
                    } 
                }); 
            }else{
                target.value=oldgroupname;
            }
            $(target).unbind('blur'); 
        },
        addHostGroupFunc:function(){
        	hgname++;
            var hostGroupTpl = [
                '<div class="panel">',
                    '<div class="panel-heading panel-head clearfix">',
                        '<span class="groupname"><input type="text"  hg="1" value="group'+ hgname +'" class="form-control iptgroup" disabled="disabled" /></span>',
                        // '<button type="button" class="btn btn-xs btn-info" editgname = "group'+ hgname +'">编辑组名</button>  ',
                        '<button type="button" class="btn btn-xs btn-info Wpr" deleteGroup = "group'+ hgname +'">删除此规则组</button>',
                        '<button type="button" class="btn btn-xs btn-info" activeGroup = "group'+ hgname +'">启用整组规则</button>',
                    '</div>',
                    '<div class="panel-body panel-content" id="group'+ hgname +'">',
                        '<table class="table table-condensed setmb">',    
                        '</table>',
                        '<button type="button" class="btn btn-xs btn-info" rulebtn="1">新增规则</button>',
                    '</div>',
                '</div>'
            ].join('');
            exports.nodes.ahgp.append(hostGroupTpl);
            var groupBtnTpl = '<button type="button" class="btn btn-sm btn-success mr" group="group' + hgname + '">group'+ hgname +'</button>';
            exports.nodes.hw.append(groupBtnTpl);
            exports.HostFileAjax({
                type : 'addGroup',
                data : {
                    domain:'group'+ hgname
                }
            });
        },
        getHostGroup: function(){
            if(scope && scope.hostData){
                hostGroupData = scope.hostData;
            }
            this.updateHostsGroupFunc(hostGroupData);
        },
        updateHostsGroupFunc: function(data){
            var hgtpl = '';
            for(name in data){
                //host列表渲染
                hgtpl += '<div class="panel">'+
                                '<div class="panel-heading panel-head clearfix">'+
                                    '<span class="groupname"><input type="text" value="'+ name +'" class="form-control iptgroup" disabled="disabled" hg="1"/></span>'+
                                    // '<button type="button" class="btn btn-xs btn-info" editgname = '+ name +'>编辑组名</button>  '+
                                    '<button type="button" class="btn btn-xs btn-info Wpr" deleteGroup = '+ name +'>删除此规则组</button>'+
                                    '<button type="button" class="btn btn-xs btn-info Wpr" activeGroup = '+ name +'>启用整组规则</button>'+
                                '</div>'+
                                '<div class="panel-body panel-content" id="'+ name +'">'+
                                    '<table class="table table-condensed setmb">';

		                                for(var i = 0;i < data[name].length; i++){
		                                    var check = data[name][i].disabled === true;
		                                    if(check){
		                                        hgtpl += '<tr>'+
		                                        			'<td class="ipt_pl"><input type="checkbox"></td><td>'+ data[name][i].ip +'</td>'+
		                                        			'<td>'+ data[name][i].domain +'</td>'+
		                                        			'<td>'+
		                                        				'<button type="button" class="btn btn-xs btn-info Wpr" editrule="1">编辑</button>'+
		                                        				'<button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button>'+
		                                        			'</td>'+
		                                        		'</tr>';
		                                    }else{
		                                        hgtpl += '<tr>'+
		                                        			'<td class="ipt_pl"><input type="checkbox" checked></td>'+
		                                        			'<td>'+ data[name][i].ip +'</td>'+
		                                        			'<td>'+ data[name][i].domain +'</td>'+
		                                        			'<td>'+
		                                        				'<button type="button" class="btn btn-info btn-xs Wpr" editrule="1">编辑</button>'+
		                                        				'<button type="button" class="btn btn-xs btn-danger" deleterule="1">删除</button>'+
		                                        			'</td>'+
		                                        		'</tr>';
		                                    }   
		                                }
                                    hgtpl += '</table>'+
                            '<button type="button" class="btn btn-xs btn-info" rulebtn="1">新增规则</button>'+
                        '</div>'+
                    '</div>';     
            }
            var gname = utils.getItemName(data);
            if(!gname.groupname.length){
                exports.nodes.ahw.hide();
            }else{
                exports.nodes.ahw.show();
            }
            var hgnametpl = mu.render(exports.btntpl, gname);
            exports.nodes.hw.html(hgnametpl);
            exports.nodes.ahgp.html(hgtpl);
        },
        showHideHostFunc : function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase() === 'button'){
                var na = $(target).attr('group');
                if(target.className === 'btn btn-sm btn-disable'){
                    target.className = 'btn btn-sm btn-success mr';
                    $('#' + na).show();
                }else{
                    target.className = 'btn btn-sm btn-disable';
                    $('#' + na).hide();
                }
            }
        },
        HostFileAjax : function(data){
            $.ajax({
                type: "POST",
                url: hostGroup,
                data: data,
                success:function(){}
            });
        },
    }
    exports.init();
});
