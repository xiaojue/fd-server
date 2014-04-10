var assert = require('assert');
var http = require('http');
var path = require('path');
var utils = require('../lib/utils.js');
var fs = require('fs');
var hosts = require('hosts-group');
var ss = require('../lib/systemService.js');
var sysconfig = require('../lib/sysconfig.json');

var fdserverService = {
    name: 'fd-server',
    description: 'the Front-end development server',
    script: path.join(__dirname, '../lib/master.js')
};
var svc = null;
var noop = function (){};

describe("fdserver", function (){
    //安装服务
    before(function (done){
        ss.getService(fdserverService, function (err, server){
            assert.ok(!err);
            svc = server;
            done();
        });
    });
    //启动服务
    before(function (done){
        assert.ok(svc);
        svc.on("start", function (){
            done();
        });
        svc.start();
    });
    //等待5s
    before(function (done){
        setTimeout(done, 5000);
    });
    
    describe("fd-server should be enabled without error", function (){
        var uipage = "http://" + sysconfig.uipage.host + "/";
        
        //测试服务web页面是否可以正常访问
        it("GET " + uipage + "return 200", function (done){
            var _cb = function (err){
                _cb = noop;
                done(err);
            };
            http.get(uipage, function (res){
                assert.equal(200, res.statusCode);
                _cb();
            }).on("error", function (err){
                // console.log(uipage + ": " + err);
                _cb(err); 
            });
        });
        //测试静态服务和路由功能
        describe("#route & static-server", function (){
            var test_host1 = "www.fdserver-test.cn";
            var test_host2 = "www.fdserver-test2.cn";
            var configPath = path.join(__dirname, "../config.json");
            before(function (done){
                hosts.set(test_host1, "127.0.0.1");
                hosts.set(test_host2, "127.0.0.1");
                
                var configJson = utils.fileToJson(configPath);
                configJson.vhost[test_host2] = {
                    "path": __dirname,
                    "status": true
                };
                fs.writeFileSync(configPath, JSON.stringify(configJson));
                done();
            });
            
            it("GET " + test_host1 + " return 404", function (done){
                var _cb = function (err){
                    _cb = noop;
                    done(err);
                };
                http.get("http://" + test_host1, function (res){
                    assert.equal(404, res.statusCode);
                    _cb();
                }).on("error", function (err){
                    // console.log(test_host1 + ": " + err);
                    _cb(err); 
                });
            });
            
            it("GET " + test_host2 + " return 200", function (done){
                var _cb = function (err){
                    _cb = noop;
                    done(err);
                };
                http.get("http://" + test_host2 + "/tmp/hello.txt", function (res){
                    assert.equal(200, res.statusCode);
                    _cb();
                }).on("error", function (err){
                    // console.log(test_host2 + ": " + err);
                    _cb(err); 
                });
            });
            
            after(function (done){
                hosts.remove(test_host1, "127.0.0.1", "defaultGroup");
                hosts.remove(test_host2, "127.0.0.1", "defaultGroup");
                done();
            });
        });
        //测试代理服务功能
        describe("#nproxy", function (){
            var simpleServer;
            before(function (done){
                simpleServer = http.createServer(function(request, response) {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write("Hello World!");
                    response.end();
                });
                simpleServer.on("listening", done);
                simpleServer.listen(3303);
            });
            
            it("GET http://localhost:8989/http://localhost:3303/ return 200", function (done){
                http.request({
                    host: "localhost",
                    port: "8989",
                    path: "http://localhost:3303/",
                    method: "GET"
                }, function(res){
                    assert.equal(200, res.statusCode);
                    done();
                }).on("error", function (err){
                    // console.log("nproxy: " + err); //卸载时会触发这里
                }).end();
            });
            
            after(function (done){
                simpleServer.close();
                simpleServer.once('close', done);
            });
        });
        
    });
    
    //关闭服务
    after(function (done){
        assert.ok(svc);
        //这里必须用once，不然在卸载的时候也会触发这里绑定的事件回调。。。
        svc.once('stop', done);
        svc.stop();
    });
     
    //卸载服务 
    after(function (done){
        var _cb = function (){
            _cb = noop;
            done();
        };
        assert.ok(svc && svc.exists);
        svc.on("uninstall",function (){
            _cb();
        });
        svc.on("error", function(){
            _cb();
        });
        svc.uninstall();
    });
});