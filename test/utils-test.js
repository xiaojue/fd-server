var utils = require('../lib/utils.js');
var assert = require('assert');
var path = require('path');
var fs = require('fs');

describe('utils', function (){
    describe('#getPort(cb)', function(){
        it('应返回一个数字端口号', function (done){
            utils.getPort(function (port){
                assert.ok(port > 0);
                done();
            }); 
        });
    }); 
    
    describe('#mixOptions(default, options)', function (){
        var def = {
            name: 'test',
            message: 'test mixOptions'
        };
        var opt = {
            message: 'success test',
            other: 'useless'
        };
        
        it('应该依default合并出一个新的参数对象', function (){
            var obj = utils.mixOptions(def, opt);
            
            assert.equal(obj.name, def.name);
            assert.equal(obj.message, opt.message);
            assert.ok(typeof obj.other === 'undefined');            
        });
    });
    
    describe('#mkdirsSync(dirname, mode)', function(){
        it('应该返回一个创建目录成功的真值true', function (){
            var dir = path.join(__dirname, "./test1/test2/");
            
            var r = utils.mkdirsSync(dir);
            assert.ok(r);//true
            assert.ok(fs.existsSync(dir));//true
            fs.rmdirSync(dir);
            fs.rmdirSync(path.join(dir, '..'));
        });
    });

    describe('#md5(str)', function (){
        it.skip('md5("test") should return "098f6bcd4621d373cade4e832627b4f6"', function (){
            assert.equal(utils.md5("test"), "098f6bcd4621d373cade4e832627b4f6");
        });
    });
    
    describe('#watchFile(filepath, callback, time)', function(){
        var testfile = path.join(__dirname, './testfile.js');
        this.timeout(5000);
        
        it('should execute without error', function (done){
            utils.watchFile(testfile, function (err){
                assert.ok(err);
                fs.writeFileSync(testfile, '{}');
                utils.watchFile(testfile, function (err, json){
                    assert.ok(!err);
                    assert.equal(1, json.status);
                    fs.unlinkSync(testfile);
                    done();
                },3);
                setTimeout(function (){
                    fs.writeFileSync(testfile, '{"status": "1"}');
                },2000);
            });
        });
    });
});