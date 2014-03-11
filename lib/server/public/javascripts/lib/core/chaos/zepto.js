/**
 * @fileoverview zepto lib 混合文件 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/core/chaos/zepto',function(require,exports,module){

	//zepto modules
	var Zepto = require('lib/core/zepto/zepto');
	require('lib/core/zepto/event');
	require('lib/core/zepto/detect');
	require('lib/core/zepto/fx');
	require('lib/core/zepto/ajax');
	require('lib/core/zepto/form');
	require('lib/core/zepto/data');

	//zepto plugin
	require('lib/core/extra/zepto/zepto');
	require('lib/core/extra/zepto/prefixfree');
	require('lib/core/extra/zepto/transform');
	require('lib/core/extra/zepto/hammer');
	require('lib/core/extra/zepto/transit');

	module.exports = Zepto;

});


