var ss = require('../lib/systemService.js');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');

describe('systemService', function (){
    var opt = {
        "name": "fdserverTest",
        "description": "fd-server service test",
        "script": path.join(__dirname, './tmp/ss_test.js')
    };
    this.timeout(10000);
    
    describe("#getService(options, cb)", function (){
        it("should without error", function (done){
            ss.getService(opt, function (err, svc){
                assert.ok(!err);
                assert.ok(svc.exists);
                done();
            });
        });
    });
    
    describe("#remove(options, cb)", function (){
        it("should without error", function (done){
            ss.remove(opt, done);
        });
    });
});