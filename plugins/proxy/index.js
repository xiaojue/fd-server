/**
 * @author RK_CODER[javawjw@163.com]
 * @date 20150113
 * @fileoverview proxy plugin for fds
 */
var nproxy = require("nproxy");
var fs = require('fs');
var path = require('path');
var async = require("async");
var logger = require('../../lib/log/logger');

var proxyListFilePath = path.join(__dirname, 'proxy_list.js');
var proxyPort = null;
var proxyServer = null;
var noop = function (){};
/**
* 启动代理服务 proxy代理列表 cb回调函数
*/
function runProxy(proxy, cb){
    var fileContent = "module.exports = " + JSON.stringify(proxy, null, 4) + ";";
    fs.writeFileSync(proxyListFilePath, fileContent);
    proxyServer = nproxy(proxyPort.port, {
        "responderListFilePath": proxyListFilePath,
        "debug": false
    });
    //parallel：并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行。传给最终callback的数组中的数据按照tasks中声明的顺序，而不是执行完成的顺序。
    async.parallel({
        https: function(callback) {
            proxyServer['httpsServer'].on('listening', callback);
        },
        http: function(callback) {
            proxyServer['httpServer'].on('listening', callback);
        }
    },
    cb);
}
/**
* 关闭代理 cb回调
*/
function stopProxy(cb){
    if (proxyServer) {
        async.parallel({
            http: function(callback) {
                proxyServer['httpServer'].close();
                callback();
            },
            https: function(callback) {
                proxyServer['httpsServer'].close();
                callback();
            }
        },
        function() {
            proxyServer = null;
            //fs.unlinkSync(listFilePath);
            if (cb) cb();
        });
    }
}

module.exports = function (fds){

    return {
        start: function (cb){
            logger.info("proxy start ...");
            var configManager = fds.configManager;
            var config = configManager.getJson();
            var sysConfig = configManager.sysconfig;

            if(!config.proxy){
                config.proxy = [];
                configManager.set(config);
            }
            proxyPort = sysConfig.nproxy || {
                "host":"127.0.0.1",
                "port":8989
            };
            var getProxyList = function (proxylist){
                var proxy = [], i, item;
                for(i = 0; i < proxylist.length; i++){
                    item = proxylist[i];
                    if(!item.disabled){
                        proxy.push(item);
                    }
                }
                return proxy;
            };
            runProxy(getProxyList(config.proxy), cb);

            /*configManager.on('change', function (json){
                // console.log(arguments);
                stopProxy(function (){
                    runProxy(getProxyList(config.proxy), noop);
                });
            });*/
        },
        stop: function (cb){
            logger.info("proxy stop ...");
            stopProxy(cb);
        }
    };
};