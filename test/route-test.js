/*
 * route index unit listing.
 */
var index = require('../lib/server/routes/index.js');
var assert = require('assert');
var path = require('path');
var fs = require('fs');

describe('route-index', function (){
    var resExtend = {
        __proto__: http.ServerResponse.prototype
    };
    resExtend.json = function(obj){};
    //添加一个vhost
    describe('#scope save(req, res)', function (){
        var data =  {"vhost":{"test.sina.com.cn":{"path":"d:\\workspace","status":true}}}
        it('添加vhost scope', function (){
            var req = {body:{}}
            index.scope(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(typeof newdata.hosts);            
        });   

        it('添加vhost save', function (){
            var body = data;
            var req = {body: body}
            index.save(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(typeof newdata.vhost['test.sina.com.cn']);            
        });    
    });

    //vhost 禁用/启用 切换
    describe('#toggleHost(req, res)', function (){
        it('vhost 禁用/启用 切换', function (){
            var olddata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            var req = {body:{domain:'test.sina.com.cn'}}
            index.toggleHost(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            var oldStatus = olddata.vhost['test.sina.com.cn']['status'];
            var newstatus = newdata.vhost['test.sina.com.cn']['status'];
            assert.equal(!newstatus,  oldStatus);          
        });    
    });

    //vhost 是否透明代理线上
    describe('#onlineProxy(req, res)', function (){
        it('vhost 是否透明代理线上', function (){
            var olddata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            var req = {body:{domain:'test.sina.com.cn',openOnlineProxy:0}}
            index.onlineProxy(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            var newstatus = newdata.vhost['test.sina.com.cn']['openOnlineProxy'];
            assert.ok(typeof newstatus);          
        });    
    });

    //移除一个vhost
    describe('#removeHost(req, res)', function (){
        it('移除vhost', function (){
            var req = {body:{domain:'test.sina.com.cn'}}
            index.removeHost(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(!newdata.vhost['test.sina.com.cn']);            
        });    
    });

    //proxy创建规则组
    describe('#proxy unit test', function (){
        it('#addProxyGroup(req, res)', function (){
            var data = {"proxyGroup":["test12345"]}
            var req = {body: data}
            index.save(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.equal(newdata.proxyGroup[0],'test12345');            
        }); 

        it('#editProxyGroup(req, res)', function (){
            var req = {body: {oldname : "test12345", newname : "newtest12345"}};
            index.editProxyGroup(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.equal(newdata.proxyGroup[0],'newtest12345');            
        }); 
        
        it('#addproxy(req, res)', function (){
            var data = {proxy:[{'pattern':"http://baidu.com",'responder':"http://sina.com.cn",'disabled':false,'group':"newtest12345"}]};
            var req = {body: data};
            index.save(req,resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(typeof newdata.proxy[0]);            
        }); 

        it('#editProxy(req, res)', function (){
            var data = {
                pattern:"http://baidu.com",
                responder:"http://qq.com",
                oldpattern:"http://baidu.com",
                oldresponder:"http://sina.com.cn"
            }
            var req = {body: data};
            index.editProxy(req,resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.equal(newdata.proxy[0].responder,"http://qq.com");            
        });

        it('#disabledProxy(req, res)', function (){
            var data = {pattern:"http://baidu.com",responder:"http://qq.com",disabled:'true'};
            var req = {body: data}
            index.disabledProxy(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(newdata.proxy[0].disabled);            
        }); 

        it('#removeProxy(req, res)', function (){
            var data = {'pattern':"http://baidu.com",'responder':"http://qq.com"};
            var req = {body: data}
            index.removeProxy(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(typeof !newdata.proxy[0]);            
        }); 

        it('#removeGroup(req, res)', function (){
            var data = {groupname:'newtest12345'};
            var req = {body: data}
            index.removeGroup(req, resExtend);
            var newdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'config.json'), 'utf-8'));
            assert.ok(typeof !newdata.proxyGroup[0]);            
        }); 
    });
});