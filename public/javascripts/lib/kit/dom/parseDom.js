/**
 * @fileoverview dom解析 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */

define('lib/kit/dom/parseDom',function(require,exports,module){

	var $ = require('lib');

	//简单的dom解析
	//根据一个父元素和内部自定义属性为data-role="xxx"的元素，取得dom元素列表
	//nodes.root为根节点
	//param {Element} node 做DOM解析的根节点
	//param {Object} options 其他选项
	/* example
	<div id="box">
		<div data-role="content"></div>
		<p data-role="item"></p>
		<p data-role="item"></p>
	</div>
	parseDom('#box') === {
		content : $('#box [data-role="content"]'),
		item : $('#box [data-role="item"]')
	};

	parseDom('#box', {
		roles : ['content', 'target']
	}) === { content : $('#box [data-role="content"]') }
	//日志：Node [data-role="target"] not exists in #box
	*/
	var parseDom = function(node, options){
		var conf = $.extend({
			camelCase : true,	//是否将角色名称转换为驼峰格式
			merge : true,		//是否自动检查DOM，混合未经roles定义的元素
			log : false,		//是否输出元素检查日志
			prop : 'data-role',	//检查的自定义属性，判断以何种自定义属性解析DOM

			//期望的角色列表，存在这个列表，则会以这个列表为准。
			//在查找不到对应元素时输出日志
			roles : []
		}, options);

		var nodes = {};
		var selector = '';
		var log = $.log;
		var prop = conf.prop.toString();
		var roles = Array.isArray(conf.roles) ? conf.roles : [];

		node = $(node);
		selector = node.selector;

		//先检查预定的角色列表( conf.roles )，用 null 填充 nodes 对象
		//以便之后遍历生成元素并检查DOM元素存在性
		if(roles.length > 0){
			roles.forEach(function(role){
				var name = conf.camelCase ? $.camelCase(role) : role;
				nodes[name] = null;
			});
		}

		//查找根节点下所有带有自定义属性[data-role]的元素
		//如果允许合并DOM元素(默认 conf.mrege === true)，则会将不在conf.roles列表中的元素也混合到nodes对象中
		if(roles.length <= 0 || conf.merge){
			node.find('[' + prop + ']').each(function(){
				var role = $(this).attr(prop);
				var name = conf.camelCase ? $.camelCase(role) : role;
				if(!nodes[name] && nodes[name] !== null){
					nodes[name] = null;
					roles.push(role);
				}
			});
		}

		//遍历 conf.roles 列表，将所需的 dom 元素查找出来混合入 nodes 对象
		//这样即使实际不存在DOM元素，而nodes对象中也存在对应可操作的zepto对象
		$.each(roles, function(index, role){
			var roleSelector = '[' + prop + '="' + role + '"]';
			var name = conf.camelCase ? $.camelCase(role) : role;
			nodes[name] = node.find(roleSelector);
			if(nodes[name].length <= 0 && conf.log){
				log('Node: ' + roleSelector + ' not exists in ' + selector);
			}
		});

		//设置nodes对象的root属性为根节点
		if(!nodes.root){
			nodes.root = node;
		}
		return nodes;
	};

	module.exports = parseDom;

});

