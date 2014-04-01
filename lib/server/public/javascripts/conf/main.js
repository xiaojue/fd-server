/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('conf/main',function(require,exports,module){
    var $ = require('lib');
    require("jobs/switchTab");
    require("jobs/vhost");
    require("jobs/proxyGroup");
    require("jobs/hostGroup");
});
