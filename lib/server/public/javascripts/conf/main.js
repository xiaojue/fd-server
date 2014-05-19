/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	require('jquery-ui');
	require('bootstrap');
	require('select');
	require('switch');
	require('checkbox');
	var dialog = require('mods/dialog');
	var _ = require('lib/lodash');
	_.templateSettings = {
		evaluate: /\{%([\s\S]+?)%\}/g,
		interpolate: /\{%=([\s\S]+?)%\}/g
	};

	function addLine(table, lineTpl) {
		var newtr = table.find('[data-node=newtr]');
		if (newtr.length) {
			newtr.find('input:eq(0)').focus();
			lightline(newtr);
			return;
		}
		var tr = $(lineTpl);
		table.find('tbody').append(tr);
		tr.find('input:eq(0)').focus();
	}

	function lightline(el, color) {
		color = color || '#ccc';
		el.css({
			'background-color': color,
			'transition': 'background-color 0.5s ease-in'
		});
		setTimeout(function() {
			el.css({
				'background-color': '',
				'transition': 'background-color 0.5s ease-out'
			});
		},
		500);

	}

	//统一收集数据，给动画延迟，加锁
	function fetch(configs) {
		var cb = configs.success || function() {};
		if (!fetch.lock) {
			fetch.lock = true;
			configs.success = function() {
				var args = Array.prototype.slice.call(arguments, 0);
				fetch.lock = false;
				cb.apply(this, args);
			};
			configs.dataType = configs.dataType || 'json';
			setTimeout(function() {
				$.ajax(configs);
			},
			250);
		}
	}

	var backbone = require('lib/backbone');

	var scope = backbone.Model.extend({
		setData: function(key, filter) {
			var self = this;
			this.fetch({
				success: function() {
					var data = filter(self.get(key));
					if (data) {
						self.save(key, data, {
							success: function() {
								self.trigger('change:' + key);
							}
						});
					}
				}
			});
		},
		initialize: function() {
			this.fetch();
		},
		url: '/scope'
	});

	var commonView = {
		cancel: function(e) {
			$(e.target).closest('tr').remove();
		},
		editinput: function(e) {
			var target = $(e.target);
			var input = $('<input type="text" class="form-control">').val(target.text().trim());
			target.html(input);
			input.focus();
		}
	};

	var $scope = new scope();
	var vhosts = backbone.View.extend({
		model: $scope,
		el: '#vhosts',
		template: $('#vhosts_template').html(),
		events: {
			'click [data-action=addVhost]': 'addVhost',
			'click [data-action=editinput]': 'editinput',
			'blur [data-action=editinput]': 'blurinput',
			'click [data-action=openOnlineProxy]': 'openOnlineProxy',
			'click [data-action=removeVhost]': 'removeVhost',
			'click [data-action=savenew]': 'savenew',
			'click [data-action=cancel]': 'cancel',
			'click [data-action=toggleRun]': 'toggleRun'
		},
		editinput: commonView.editinput,
		cancel: commonView.cancel,
		blurinput: function(e) {
			var model = this.model;
			var target = $(e.target);
			var val = target.val().trim();
			var parent = target.parent();
			var nodeType = parent.attr('data-node');
			var oldvalue = parent.attr('data-value');
			model.setData('vhost', function(data) {
				if (nodeType == 'vhostsdomain') {
					if (val === '' || val == oldvalue) {
						parent.html(oldvalue);
						return false;
					}
					data[val] = data[oldvalue];
					delete data[oldvalue];
				} else if (nodeType == 'vhostpath') {
					if (val === '' || val == data[oldvalue]['path']) {
						parent.html(data[oldvalue]['path']);
						return false;
					}
					data[oldvalue]['path'] = val;
				}
				return data;
			});
		},
		openOnlineProxy: function(e) {
			var model = this.model;
			var target = $(e.target).closest('.switch').find('input[type=checkbox]');
			var checked = target.attr('checked') ? 0: 1;
			var domain = target.attr('data-domain');
			fetch({
				url: '/toggleOnlineProxy',
				type: 'post',
				data: {
					domain: domain,
					openOnlineProxy: checked
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		addVhost: function() {
			var tr = '<tr data-node="newtr">\
					<td><input data-node="domain" type="text" class="form-control"></td>\
					<td><input data-node="path" type="text" class="form-control"></td>\
					<td colspan="2"></td>\
					<td>\
						<button data-action="savenew" class="btn btn-primary">Save</button>\
						<button data-action="cancel" class="btn btn-default">Cancel</button>\
					</td>\
				</tr>';
			addLine($('#vhostTable'), tr);
		},
		savenew: function(e) {
			var model = this.model;
			var newtr = $(e.target).closest('[data-node=newtr]');
			var domain = newtr.find('[data-node=domain]').val().trim();
			var path = newtr.find('[data-node=path]').val().trim();
			if (domain && path) {
				var data = {};
				data[domain] = {
					path: path,
					status: true
				};
				model.fetch({
					success: function() {
						model.save('vhost', _.extend(model.get('vhost'), data), {
							success: function() {
								model.trigger('change:vhost');
							}
						});
					}
				});
			} else {
				newtr.find('input[type=text]').each(function(index, el) {
					lightline($(el), '#f5d313');
				});
			}
		},
		removeVhost: function(e) {
			var model = this.model;
			var domain = $(e.target).closest('button').attr('data-value');
			fetch({
				url: '/removeHost',
				type: 'post',
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
			var target = $(e.target).closest('.switch').find('input[type=checkbox]');
			var domain = target.attr('data-value');
			fetch({
				url: '/toggleHost',
				type: 'post',
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
			this.$el.find('[data-toggle=checkbox]').checkbox();
			this.$el.find('[data-node=toggleRun]').wrap('<div class="switch " data-action="toggleRun">').parent().bootstrapSwitch();
			this.$el.find('[data-node=openOnlineProxy]').wrap('<div class="switch " data-action="openOnlineProxy">').parent().bootstrapSwitch();
		},
		initialize: function() {
			var self = this;
			this.model.on('change:vhost', function() {
				self.render();
			});
		}
	});

	var proxy = backbone.View.extend({
		model: $scope,
		el: '#proxy',
		events: {
			'click [data-action=addProxyGroup]': 'addProxyGroup',
			'click [data-action=editGroup]': 'editGroup',
			'click [data-action=editinput]': 'editinput',
			'blur [data-action=editinput]': 'blurinput',
			'click [data-action=activeGroup]': 'activeGroup',
			'click [data-action=addProxy]': 'addProxy',
			'click [data-action=removeGroup]': 'removeGroup',
			'click [data-action=editProxy]': 'editProxy',
			'click [data-action=removeProxy]': 'removeProxy',
			'click [data-action=savenew]': 'savenew',
			'click [data-action=cancel]': 'cancel',
			'change [data-action=checkProxy]': 'checkProxy'
		},
		editinput: commonView.editinput,
		cancel: commonView.cancel,
		savenew: function(e) {
			var model = this.model;
			var tr = $(e.target).closest('tr');
			var srcval = tr.find('input[data-node=source]').val().trim();
			var toval = tr.find('input[data-node=target]').val().trim();
			var groupname = tr.closest('table').attr('data-value');
			if (srcval === '' || toval === '') {
				tr.find('input[type=text]').each(function(index, el) {
					lightline($(el), '#f5d313');
				});
				return;
			}
			var data = {
				'pattern': srcval,
				'responder': toval,
				'disabled': false,
				'group': groupname
			};
			model.setData('proxy', function(proxys) {
				var fixed = false;
				for (var i = 0; i < proxys.length; i++) {
					if (data.pattern === proxys[i]['pattern'] && data.responder === proxys[i]['responder']) {
						fixed = true;
					}
				}
				if (!fixed) {
					proxys.push(data);
				}
				return proxys;
			});
		},
		blurinput: function(e) {
			var model = this.model;
			var target = $(e.target);
			var val = target.val().trim();
			var tr = target.closest('tr');
			var parent = target.parent();
			var nodeType = parent.attr('data-node');
			var oldvalue = parent.attr('data-value');
			var srcval, toval, pattern, responder;
			if (val === '' || val == oldvalue) {
				parent.html(oldvalue);
				return;
			}
			if (nodeType == 'pattern') {
				srcval = val;
				toval = tr.find('[data-node=responder]').attr('data-value');
				pattern = oldvalue;
				responder = toval;
			} else if (nodeType == 'responder') {
				srcval = tr.find('[data-node=pattern]').attr('data-value');
				toval = val;
				pattern = srcval;
				responder = oldvalue;
			}
			fetch({
				url: '/editProxy',
				type: 'post',
				data: {
					'pattern': srcval,
					'responder': toval,
					'oldpattern': pattern,
					'oldresponder': responder
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		checkProxy: function(e) {
			var model = this.model;
			var target = $(e.target).closest('.switch').find('input[data-node=checkProxy]');
			var pattern = target.attr('data-value');
			var responder = target.attr('data-responder');
			var disabled = target.attr('checked') ? true: false;
			fetch({
				url: '/disabledProxy',
				type: 'post',
				data: {
					pattern: pattern,
					responder: responder,
					disabled: disabled
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		removeProxy: function(e) {
			var pattern = $(e.target).attr('data-value');
			var responder = $(e.target).attr('data-responder');
			var model = this.model;
			fetch({
				url: '/removeProxy',
				type: 'post',
				data: {
					'pattern': pattern,
					'responder': responder
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		addProxy: function(e) {
			var groupname = $(e.target).attr('data-value');
			var tr = '<tr data-node="newtr">\
					<td><input data-node="source" type="text" class="form-control"></td>\
					<td><input data-node="target" type="text" class="form-control"></td>\
					<td></td>\
					<td>\
						<button data-action="savenew" class="btn btn-primary">Save</button>\
						<button data-action="cancel" class="btn btn-default">Cancel</button>\
					</td>\
				</tr>';
			addLine($('#proxy_table_' + groupname), tr);
		},
		removeGroup: function(e) {
			var groupname = $(e.target).attr('data-value');
			var model = this.model;
			fetch({
				url: '/removeGroup',
				data: {
					groupname: groupname
				},
				type: 'post',
				success: function(data) {
					model.set(data);
					model.trigger('change:proxy');
				}
			});
		},
		activeGroup: function(e) {
			$('[data-action=activeGroup]').addClass('btn-success');
			var wrap = $(e.target).parent();
			$('.panel_group').hide();
			wrap.find('.panel_group').show();
			$(e.target).removeClass('btn-success');
			var table = $('#proxy_table_'+$(e.target).attr('data-value'));
			table.find('tbody').show();
		},
		editGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var newname = prompt('编辑组名', groupname);
			if (newname) {
				fetch({
					url: '/editProxyGroup',
					type: 'post',
					data: {
						oldname: groupname,
						newname: newname
					},
					success: function(data) {
						model.set(data);
						model.trigger('change:proxy');
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
			this.$el.find('[data-node=checkProxy]').wrap('<div class="switch " data-action="checkProxy">').parent().bootstrapSwitch();
		},
		initialize: function() {
			var self = this;
			this.model.on('change:proxy', function() {
				self.render();
			});
		}
	});

	var hosts = backbone.View.extend({
		model: $scope,
		events: {
			'click [data-action=addHostGroup]': 'addHostGroup',
			'click [data-action=editHostGroup]': 'editHostGroup',
			'click [data-action=editinput]': 'editinput',
			'blur [data-action=editinput]': 'blurinput',
			'click [data-action=activeHost]': 'activeHost',
			'click [data-action=addHost]': 'addHost',
			'click [data-action=removeHostGroup]': 'removeHostGroup',
			'click [data-action=editHost]': 'editHost',
			'click [data-action=removeHost]': 'removeHost',
			'change [data-action=checkHost]': 'disableHost',
			'click [data-action=savenew]': 'savenew',
			'click [data-action=cancel]': 'cancel',
			'click [data-action=activeHostGroup]': 'activeHostGroup',
			'click [data-action=disableHostGroup]': 'disableHostGroup'
		},
		editinput: commonView.editinput,
		cancel: commonView.cancel,
		blurinput: function(e) {
			var model = this.model;
			var target = $(e.target);
			var parent = target.parent();
			var srcval, toval;
			var domain = parent.attr('data-domain');
			var val = target.val();
			var ip = parent.attr('data-ip');
			var groupname = parent.attr('data-groupname');
			var disabled = parent.attr('data-disabled');
			var nodeType = parent.attr('data-node');
			if (nodeType == 'domain') {
				srcval = val;
				toval = ip;
				if (val == domain || val === '') {
					parent.html(domain);
					return;
				}
			} else if (nodeType == 'ip') {
				srcval = domain;
				toval = val;
				if (val == ip || val === '') {
					parent.html(ip);
					return;
				}
			}
			var data = {
				'domain': srcval,
				'ip': toval,
				'disabled': disabled,
				'groupname': groupname,
				'olddomain': domain,
				'oldip': ip
			};
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'editrule',
					data: data
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		activeHostGroup: function(e) {
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'activeGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		disableHostGroup: function(e) {
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'disableGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		disableHost: function(e) {
			var model = this.model;
			var target = $(e.target).closest('.switch').find('input[data-node=checkHost]');
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			var disabled = target.attr('checked') ? true: false;
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: disabled ? 'disablerule': 'activerule',
					data: {
						domain: domain,
						ip: ip,
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		addHostGroup: function(e) {
			var model = this.model;
			var groupname = prompt('请输入Hosts组名');
			if (groupname) {
				model.fetch({
					success: function() {
						fetch({
							url: '/hostFile',
							type: 'post',
							data: {
								type: 'addGroup',
								data: {
									groupname: groupname
								}
							},
							success: function(data) {
								model.set(data);
							}
						});
					}
				});
			}
		},
		editHostGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var newname = prompt('编辑HOST组名', groupname);
			if (newname) {
				fetch({
					url: 'hostFile',
					data: {
						type: 'en',
						data: {
							oldname: groupname,
							newname: newname
						}
					},
					type: 'post',
					success: function(data) {
						model.set(data);
					}
				});
			}

		},
		activeHost: function(e) {
			$('[data-action=activeHost]').addClass('btn-success');
			var wrap = $(e.target).parent();
			$('.panel_group').hide();
			wrap.find('.panel_group').show();
			$(e.target).removeClass('btn-success');
		},
		addHost: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var tr = '<tr data-node="newtr">\
					<td><input data-node="domain" type="text" class="form-control"></td>\
					<td><input data-node="ip" type="text" class="form-control"></td>\
					<td></td>\
					<td>\
						<button data-action="savenew" class="btn btn-primary">Save</button>\
						<button data-action="cancel" class="btn btn-default">Cancel</button>\
					</td>\
				</tr>';
			addLine($('#hosts_table_' + groupname), tr);
		},
		savenew: function(e) {
			var model = this.model;
			var target = $(e.target);
			var tr = target.closest('tr');
			var groupname = target.closest('table').attr('data-groupname');
			var srcval = tr.find('[data-node=domain]').val().trim();
			var toval = tr.find('[data-node=ip]').val().trim();
			if(srcval === '' || toval ===''){
				tr.find('input[type=text]').each(function(index, el) {
					lightline($(el), '#f5d313');
				});
				return;	
			}
			var data = {
				'domain': srcval,
				'ip': toval,
				'disabled': false,
				'groupname': groupname
			};
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'editrule',
					data: data
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		removeHostGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'removeGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		removeHost: function(e) {
			var model = this.model;
			var target = $(e.target).closest('button');
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'deleterule',
					data: {
						domain: domain,
						ip: ip,
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		el: '#hosts',
		template: $('#hosts_template').html(),
		render: function() {
			this.$el.html(_.template(this.template, this.model.attributes));
			this.$el.find('[data-node=checkHost]').wrap('<div class="switch " data-action="checkHost">').parent().bootstrapSwitch();
		},
		initialize: function() {
			var self = this;
			this.model.on('change:hosts', function() {
				self.render();
			});
		}
	});

	var config = backbone.View.extend({
		model: $scope,
		events: {
			'click [data-action=preview]': 'previewFunc',
			'click [data-action=upload]': 'uploadFunc',
			'focus [data-action=databox]': 'focusFuncText',
			'blur [data-action=databox]': 'blurFuncText'
		},
		previewFunc: function(e) {
			fetch({
				url: '/scope',
				type: 'get',
				success: function(data) {
					data = JSON.stringify(data, null, 4);
					data = "<pre>" + data + "</pre>";
					$(e.target).next().html(data);
				}
			});
		},
		uploadFunc: function() {
			var textbox = $('#databox');
			var text = textbox.val().trim();
			if (text === '') {
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
			if (flag && type) {
				fetch({
					url: '/import',
					type: 'post',
					data: data,
					success: function(data) {
						alert("导入成功");
						textbox.val('');
					}
				});
			} else {
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
		}
	});
	var log = backbone.View.extend({
		model: $scope,
		events: {
			'click input[data-action=refresh]':'refresh'
		},
		refresh:function(){
			var len = $('[data-node=len]').val() || 50;
			$('[data-node=iframe]').attr('src','/log?len='+len);	
		},
		el:'#log',
		template:$('#log_template').html(),
		render:function(){
			this.$el.html(this.template);
		},
		initialize:function(){
			this.render();			   
		}
	});

	var vhostsView = new vhosts();
	var proxyView = new proxy();
	var hostsView = new hosts();
	var configView = new config();
	var logView = new log();

	var workspace = backbone.Router.extend({
		routes: {
			'': "vhosts",
			'vhosts': "vhosts",
			'proxy': "proxy",
			'hosts': "hosts",
			'config': "config",
			'log': "log"
		},
		vhosts: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(0)').addClass('active');
			$('.J_content').hide();
			vhostsView.$el.closest('.J_content').show();
		},
		proxy: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(1)').addClass('active');
			$('.J_content').hide();
			proxyView.$el.closest('.J_content').show();
		},
		hosts: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(2)').addClass('active');
			$('.J_content').hide();
			hostsView.$el.closest('.J_content').show();
		},
		config: function() {
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(3)').addClass('active');
			$('.J_content').hide();
			configView.$el.closest('.J_content').show();
		},
		log:function(){
			$('#switch-tab li').removeClass('active');
			$('#switch-tab li:eq(4)').addClass('active');
			$('.J_content').hide();
			logView.$el.closest('.J_content').show();
		},
		initialize: function() {
			backbone.history.start();
		}
	});

	var myRouter = new workspace();
});

