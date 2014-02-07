/**
 * @fileoverview 统一地址管理组件
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/location',function(require,exports,module){

	var $ = require('lib');
	var $historyM = require('lib/common/historyM');
	var $router = require('lib/common/router');
	var $channel = require('lib/common/channel');

	var LocationM = {
		set : function(url){
			$router.setLocation(url);
		},
		get : function(){
			return $historyM.parseURL();
		}
	};

	$channel.add('changeLocation', LocationM.set);

	module.exports = LocationM;
});

