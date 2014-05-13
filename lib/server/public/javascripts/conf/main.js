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
			'click [data-action=editinput]': 'editinput',
			'blur [data-action=editinput]': 'blurinput',
			'click [data-action=openOnlineProxy]': 'openOnlineProxy',
			'click [data-action=removeVhost]': 'removeVhost',
			'click [data-action=savenew]': 'savenew',
			'click [data-action=cancel]': 'cancel',
			'click [data-action=toggleRun]': 'toggleRun'
		},
		blurinput: function(e) {
			var model = this.model;
			var target = $(e.target);
			var val = target.val().trim();
			var parent = target.parent();
			var nodeType = parent.attr('data-node');
			var oldvalue = parent.attr('data-value');
			model.fetch({
				success: function() {
					var data = model.get('vhost');
					if (nodeType == 'vhostsdomain') {
						if (val === '') {
							parent.html(oldvalue);
							return;
						}
						data[val] = data[oldvalue];
						if (val != oldvalue) delete data[oldvalue];
					} else if (nodeType == 'vhostpath') {
						if (val === '') {
							parent.html(data[oldvalue]['path']);
							return;
						}
						data[oldvalue]['path'] = val;
					}
					model.save('vhost', data, {
						success: function() {
							model.trigger('change:vhost');
						}
					});
				}
			});
		},
		editinput: function(e) {
			var target = $(e.target);
			var input = $('<input type="text" class="form-control">').val(target.text().trim());
			target.html(input);
			input.focus();
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
			var model = this.model;
			var table = $('#vhostTable');
			var newtr = table.find('[data-node=newtr]');
			if (newtr.length) {
				lightline(newtr);
				return;
			}
			var tr = '<tr data-node="newtr">\
					<td><input data-node="domain" type="text" class="form-control"></td>\
					<td><input data-node="path" type="text" class="form-control"></td>\
					<td colspan="2"></td>\
					<td>\
						<button data-action="savenew" class="btn btn-primary">Save</button>\
						<button data-action="cancel" class="btn btn-default">Cancel</button>\
					</td>\
				</tr>';
			table.find('tbody').append(tr);
		},
		cancel: function(e) {
			$(e.target).closest('tr').remove();
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
			'click [data-action=activeGroup]': 'activeGroup',
			'click [data-action=addProxy]': 'addProxy',
			'click [data-action=removeGroup]': 'removeGroup',
			'click [data-action=editProxy]': 'editProxy',
			'click [data-action=removeProxy]': 'removeProxy',
			'change [data-action=checkProxy]': 'checkProxy'
		},
		checkProxy: function(e) {
			var model = this.model;
			var pattern = $(e.target).attr('data-value');
			var responder = $(e.target).attr('data-responder');
			var disabled = $(e.target).attr('checked') ? true: false;
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
		editProxy: function(e) {
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
		addProxy: function(e) {
			var groupname = $(e.target).attr('data-value');
			var model = this.model;
			dialog.init({
				srcText: '源地址',
				toText: '代理到',
				success: function(srcval, toval, errnode) {
					var data = {
						'pattern': srcval,
						'responder': toval,
						'disabled': false,
						'group': groupname
					};
					model.fetch({
						success: function() {
							var fixed = false;
							var proxys = model.get('proxy');
							for (var i = 0; i < proxys.length; i++) {
								if (data.pattern === proxys[i]['pattern'] && data.responder === proxys[i]['responder']) {
									fixed = true;
								}
							}
							if (!fixed) {
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
		}
	});

	var hosts = backbone.View.extend({
		model: $scope,
		events: {
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
			var target = $(e.target);
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
			dialog.init({
				srcText: 'domain',
				toText: 'ip',
				success: function(srcval, toval, errnode) {
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
							dialog.hide();
						}
					});
				}
			});
			dialog.show();
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
		editHost: function(e) {
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
							dialog.hide();
						}
					});
				}
			});
			dialog.show();
			$('#srcUrl').val(domain);
			$('#urlTo').val(ip);
		},
		removeHost: function(e) {
			var model = this.model;
			var target = $(e.target);
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
		focusFuncText: function(e) {
			if ($(e.target).val().trim() === '请粘贴导入的配置文件') {
				$(e.target).html('');
			}
		},
		blurFuncText: function(e) {
			if ($(e.target).val().trim() === '') {
				$(e.target).html('请粘贴导入的配置文件');
			}
		},
		uploadFunc: function() {
			var textbox = $('#databox');
			var text = textbox.val().trim();
			if (text === '' || text === '请粘贴导入的配置文件') {
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
		initialize: function() {
			backbone.history.start();
		}
	});

	var myRouter = new workspace();
});

