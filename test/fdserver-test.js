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

describe("fdserver", function (){
    this.timeout(30000);
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
    //等待2s
    before(function (done){
        setTimeout(done, 2000);
    });
    
    describe("fd-server should be enabled without error", function (){
        var uipage = "http://" + sysconfig.uipage.host + "/";
        
        //测试服务web页面是否可以正常访问
        it("GET " + uipage + "return 200", function (done){
            http.get(uipage, function (res){
                assert.equal(200, res.statusCode);
                done();
            }).on("error", function (err){
                done(err); 
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
            
            it("GET bouncy " + test_host1 + " return 404", function (done){
                http.get("http://" + test_host1, function (res){
                    assert.equal(404, res.statusCode);
                    done();
                }).on("error", function (err){
                    done(err); 
                });
            });
            
            it("GET bouncy " + test_host2 + " return 200", function (done){
                http.get("http://" + test_host2 + "/tmp/hello.txt", function (res){
                    assert.equal(200, res.statusCode);
                    done();
                }).on("error", function (err){
                    done(err); 
                });
            });
            
            after(function (done){
                hosts.remove(test_host1, "127.0.0.1", "defaultGroup");
                hosts.remove(test_host2, "127.0.0.1", "defaultGroup");
                done();
            });
        });
        
        /**
        测试代理功能，因为代理需要设置浏览器代理，暂时想不出怎么处理
        describe("#nproxy", function (){
            
        });
        */
        
    });
    
    after(function (done){
        assert.ok(svc);
        svc.on("stop", done);
        svc.stop();
    });
    /** 
    最后卸载服务，存在问题尚未解决 
    after(function (done){
        setTimeout(done, 15000);
    });
    after(function(done){
        assert.ok(svc);
        ss.remove(fdserverService, done);
    }); */
});