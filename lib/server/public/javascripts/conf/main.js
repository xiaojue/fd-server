/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	var dialog = require('mods/dialog');
	var _ = require('lib/lodash');
	_.templateSettings = {
		evaluate: /\{%([\s\S]+?)%\}/g,
		interpolate: /\{%=([\s\S]+?)%\}/g
	};

	var backbone = require('lib/backbone');

	var scope = backbone.Model.extend({
		initialize: function() {
			this.fetch();
		},
		url: '/scope'
	});

	var $scope = new scope();
	var vhosts = backbone.View.extend({
		model: $scope,
		el: '#vhosts',
		template: $('#vhosts_template').html(),
		events: {
			'click [data-action=addVhost]': 'addVhost',
			'click [data-action=openOnlineProxy]':'openOnlineProxy',
			'click [data-action=removeVhost]': 'removeVhost',
			'click [data-action=toggleRun]': 'toggleRun'
		},
		openOnlineProxy:function(e){
			var model = this.model;
			var checked = $(e.target).attr('checked') ? 0 : 1;
			var domain = $(e.target).attr('data-domain');
			$.ajax({
				url: '/toggleOnlineProxy',
				type: 'post',
				dataType: 'json',
				data: {
					domain:domain,
					openOnlineProxy:checked
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		addVhost: function() {
			var model = this.model;
			dialog.init({
				srcText: '域名',
				toText: '路径',
				success: function(srcval, toval, errnode) {
					var data = {};
					data[srcval] = {
						path: toval,
						status: true
					};
					model.fetch({
						success: function() {
							model.save('vhost', _.extend(model.get('vhost'), data), {
								success: function() {
									model.trigger('change:vhost');
									dialog.hide();
								}
							});
						}
					});
				}
			});
			dialog.show();
		},
		removeVhost: function(e) {
			var model = this.model;
			var domain = $(e.target).attr('data-value');
			$.ajax({
				url: '/removeHost',
				type: 'post',
				dataType: 'json',
				data: {
					domain: domain
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		toggleRun: function(e) {
			var model = this.model;
			var domain = $(e.target).attr('data-value');
			$.ajax({
				url: '/toggleHost',
				type: 'post',
				dataType: 'json',
				data: {
					domain: domain
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		render: function() {
			this.$el.html(_.template(this.template, this.model.attributes));
		},
		initialize: function() {
			var self = this;
			this.model.on('change:vhost', function() {
				self.render();
			});
			this.$el.hide();
		}
	});

	var proxy = backbone.View.extend({
		model: $scope,
		el: '#proxy',
		events: {
			'click [data-action=addProxyGroup]': 'addProxyGroup',
			'click [data-action=editGroup]': 'editGroup',
			'click [data-action=activeGroup]': 'activeGroup',
			'click [data-action=addProxy]': 'addProxy',
			'click [data-action=removeGroup]': 'removeGroup',
			'click [data-action=editProxy]': 'editProxy',
			'click [data-action=removeProxy]': 'removeProxy',
			'change [data-action=checkProxy]': 'checkProxy'
		},
		checkProxy:function(e){
			var model = this.model; 
			var pattern = $(e.target).attr('data-value');	
			var responder = $(e.target).attr('data-responder');	
			var disabled = $(e.target).attr('checked') ? true : false;
			$.ajax({
				url:'/disabledProxy',
				type:'post',
				data:{
					pattern:pattern,
					responder:responder,
					disabled:disabled
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});
		},
		removeProxy:function(e){
			var pattern = $(e.target).attr('data-value');	
			var responder = $(e.target).attr('data-responder');	
			var model = this.model;
			$.ajax({
				url:'/removeProxy',
				type:'post',
				dataType:'json',
				data:{'pattern':pattern,'responder':responder},
				success:function(data){
					model.set(data);	
				}
			});
		},
		editProxy:function(e){
			var target = $(e.target);
			var pattern = target.attr('data-pattern');	
			var responder = target.attr('data-responder');	
			var model = this.model;
			dialog.init({
				srcText: '源地址',
				toText: '代理到',
				success: function(srcval, toval, errnode) {
					model.fetch({
						success: function() {
							$.ajax({
								url:'/editProxy',
								type:'post',
								dataType:'json',
								data: {'pattern':srcval,'responder':toval,'oldpattern':pattern,'oldresponder':responder},
								success:function(data){
									model.set(data);	
									dialog.hide();
								}
							});
						}
					});
				}
			});
			dialog.show();
			$('#srcUrl').val(pattern);
			$('#urlTo').val(responder);
		},
		addProxy:function(e){
			var groupname = $(e.target).attr('data-value');
			var model = this.model;
			dialog.init({
				srcText: '源地址',
				toText: '代理到',
				success: function(srcval, toval, errnode) {
					var data = {'pattern':srcval,'responder':toval,'disabled':false,'group':groupname};
					model.fetch({
						success: function() {
							var fixed = false;
							var proxys = model.get('proxy');
							for(var i=0; i<proxys.length; i++){
								if(data.pattern === proxys[i]['pattern'] && data.responder === proxys[i]['responder']){
									fixed = true;
								}
							}
							if(!fixed){
								proxys.push(data);
							}
							model.save('proxy', proxys, {
								success: function() {
									model.trigger('change:proxy');
									dialog.hide();
								}
							});
						}
					});
				}
			});
			dialog.show();
		},
		removeGroup:function(e){
			var groupname = $(e.target).attr('data-value');
			var model = this.model;
			$.ajax({
				url:'/removeGroup',
				data:{
					groupname:groupname	
				},
				type:'post',
				dataType:'json',
				success:function(data){
					model.set(data);	
					model.trigger('change:proxy');
				}
			});
		},
		activeGroup:function(e){
			$('[data-action=activeGroup]').addClass('btn-success');
			var wrap = $(e.target).parent();	
			$('.panel_group').hide();
			wrap.find('.panel_group').show();
			$(e.target).removeClass('btn-success');
		},
		editGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var newname = prompt('编辑组名', groupname);
			if (newname) {
				$.ajax({
					url:'/editProxyGroup',
					type:'post',
					dataType:'json',
					data:{
						oldname:groupname,
						newname:newname
					},
					success:function(data){
						model.set(data);			
					}
				});
			}
		},
		addProxyGroup: function(e) {
			var model = this.model;
			var groupname = prompt('请输入组名');
			if (groupname) {
				model.fetch({
					success: function() {
						model.save('proxyGroup', _.union(model.get('proxyGroup'), [groupname]), {
							success: function() {
								model.trigger('change:proxy');
							}
						});
					}
				});
			}
		},
		template: $('#proxy_template').html(),
		render: function() {
			this.$el.html(_.template(this.template, this.model.attributes));
		},
		initialize: function() {
			var self = this;
			this.model.on('change:proxy', function() {
				self.render();
			});
			this.$el.hide();
		}
	});

	var hosts = backbone.View.extend({
		model: $scope,
		events:{
			'click [data-action=addHostGroup]': 'addHostGroup',
			'click [data-action=editHostGroup]': 'editHostGroup',
			'click [data-action=activeHost]': 'activeHost',
			'click [data-action=addHost]': 'addHost',
			'click [data-action=removeHostGroup]': 'removeHostGroup',
			'click [data-action=editHost]': 'editHost',
			'click [data-action=removeHost]': 'removeHost',
			'change [data-action=checkHost]': 'disableHost',
			'click [data-action=activeHostGroup]': 'activeHostGroup',
			'click [data-action=disableHostGroup]': 'disableHostGroup'
		},
		activeHostGroup:function(e){
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			$.ajax({
				url:'/hostFile',
				type:'post',
				data:{
					type:'activeGroup',
					data:{
						groupname:groupname
					}
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});
		},
		disableHostGroup:function(e){
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			$.ajax({
				url:'/hostFile',
				type:'post',
				data:{
					type:'disableGroup',
					data:{
						groupname:groupname
					}
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});
		},
		disableHost:function(e){
			var model = this.model;
			var target = $(e.target);
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			var disabled = target.attr('checked') ? true : false;
			$.ajax({
				url:'/hostFile',
				type:'post',
				data:{
					type:disabled ? 'disablerule' :	 'activerule',
					data:{
						domain:domain,
						ip:ip,
						groupname:groupname
					}
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});
		},
		addHostGroup:function(e){
			var model = this.model;
			var groupname = prompt('请输入Hosts组名');
			if (groupname) {
				model.fetch({
					success: function() {
						$.ajax({
							url:'/hostFile',
							type:'post',
							data:{
								type:'addGroup',
								data:{
									groupname:groupname	
								}
							},
							dataType:'json',
							success:function(data){
								model.set(data);		
							}
						});
					}
				});
			}
		},
		editHostGroup:function(e){
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var newname = prompt('编辑HOST组名', groupname);
			if (newname) {
				$.ajax({
					url:'hostFile',
					data:{
						type:'en',
						data:{
							oldname:groupname,
							newname:newname
						}
					},
					type:'post',
					dataType:'json',
					success:function(data){
						model.set(data);	
					}
				});
			}
				
		},
		activeHost:function(e){
			$('[data-action=activeHost]').addClass('btn-success');
			var wrap = $(e.target).parent();	
			$('.panel_group').hide();
			wrap.find('.panel_group').show();
			$(e.target).removeClass('btn-success');
		},
		addHost:function(e){
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			dialog.init({
				srcText: 'domain',
				toText: 'ip',
				success: function(srcval, toval, errnode) {
					var data = {'domain':srcval,'ip':toval,'disabled':false,'groupname':groupname};
					$.ajax({
						url:'/hostFile',
						type:'post',
						dataType:'json',
						data:{
							type:'editrule',
							data:data
						},
						success:function(data){
							model.set(data);			
							dialog.hide();
						}
					});
				}
			});
			dialog.show();
		},
		removeHostGroup:function(e){
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			$.ajax({
				url:'/hostFile',
				type:'post',
				data:{
					type:'removeGroup',
					data:{
						groupname:groupname
					}
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});		 
		},
		editHost:function(e){
			var model = this.model;
			var target = $(e.target);
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			var disabled = target.attr('data-disabled');
			dialog.init({
				srcText: 'domain',
				toText: 'ip',
				success: function(srcval, toval, errnode) {
					var data = {'domain':srcval,'ip':toval,'disabled':disabled,'groupname':groupname,'olddomain':domain,'oldip':ip};
					$.ajax({
						url:'/hostFile',
						type:'post',
						dataType:'json',
						data:{
							type:'editrule',
							data:data
						},
						success:function(data){
							model.set(data);			
							dialog.hide();
						}
					});
				}
			});
			dialog.show();
			$('#srcUrl').val(domain);
			$('#urlTo').val(ip);
		},
		removeHost:function(e){
			var model = this.model;
			var target = $(e.target);
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			$.ajax({
				url:'/hostFile',
				type:'post',
				data:{
					type:'deleterule',
					data:{
						domain:domain,
						ip:ip,
						groupname:groupname
					}
				},
				dataType:'json',
				success:function(data){
					model.set(data);	
				}
			});
		},
		el: '#hosts',
		template: $('#hosts_template').html(),
		render: function() {
			this.$el.html(_.template(this.template, this.model.attributes));
		},
		initialize: function() {
			var self = this;
			this.model.on('change:hosts', function() {
				self.render();
			});
			this.$el.hide();
		}
	});
	
	var config = backbone.View.extend({
		model: $scope,
		events:{
			'click [data-action=preview]': 'previewFunc',
			'click [data-action=upload]': 'uploadFunc',
			'focus [data-action=databox]': 'focusFuncText',
			'blur [data-action=databox]': 'blurFuncText'
		},
		previewFunc: function(e) {
			$.ajax({
				url: '/scope',
				type: 'get',
				dataType: 'json',
				success: function(data) {
					var data = JSON.stringify(data,null,4);
                    data = "<pre>" + data + "</pre>";
					$(e.target).next().html(data);
				}
			});
		},
		focusFuncText: function(e) {
			if($(e.target).val().trim() === '请粘贴导入的配置文件'){
				$(e.target).html('');
			}
		},
		blurFuncText: function(e) {
			if($(e.target).val().trim() === ''){
				$(e.target).html('请粘贴导入的配置文件');
			}
		},
		uploadFunc: function(){
			var textbox = $('#databox');
			var text = textbox.val().trim();
			if( text === '' || text === '请粘贴导入的配置文件'){
				alert('请输入配置数据');
				return;
			}
			var data = JSON.parse(text);
			var vhost = data['vhost'],
			 	proxy = data['proxy'],
			 	proxyGroup = data['proxyGroup'],
			 	port = data['port'];
			var flag = vhost && proxy && proxyGroup && port;
			var type = vhost === Object(vhost) && proxy instanceof Array && proxyGroup instanceof Array && typeof port;
			if(flag && type){
				$.ajax({
					url: '/import',
					type: 'post',
					dataType: 'json',
					data: data,
					success: function(data) {
						alert("导入成功");
						textbox.val('');
					}
				});
			}else{
				alert('配置文件不符合要求');
			}
			
		},
		el: '#config',
		template: $('#config_template').html(),
		render: function() {
			this.$el.html(this.template);
		},
		initialize: function() {
			this.render();
			this.$el.hide();
		}
	});

	var vhostsView = new vhosts();
	var proxyView = new proxy();
	var hostsView = new hosts();
	var configView = new config();

	var workspace = backbone.Router.extend({
		routes: {
			'': "vhosts",
			'vhosts': "vhosts",
			'proxy': "proxy",
			'hosts': "hosts",
			'config': "config"
		},
		vhosts: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(0)').addClass('active');
			vhostsView.$el.show();
			proxyView.$el.hide();
			hostsView.$el.hide();
			configView.$el.hide();
		},
		proxy: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(1)').addClass('active');
			proxyView.$el.show();
			vhostsView.$el.hide();
			hostsView.$el.hide();
			configView.$el.hide();
		},
		hosts: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(2)').addClass('active');
			hostsView.$el.show();
			vhostsView.$el.hide();
			proxyView.$el.hide();
			configView.$el.hide();
		},
		config:function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(3)').addClass('active');
			hostsView.$el.hide();
			vhostsView.$el.hide();
			proxyView.$el.hide();
			configView.$el.show();
		},
		initialize: function() {
			backbone.history.start();
		}
	});

	var myRouter = new workspace();
});

