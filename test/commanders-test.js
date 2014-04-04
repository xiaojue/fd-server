var fdserver = require('../lib/commanders.js');
var assert = require('assert');
var commanders = fdserver.commanders;

describe("commanders" , function (){
    describe("#install", function (){
        it("should support 'install' command", function (){
            assert.equal(typeof commanders.install.exec, 'function');
        });
    });
    
    describe("#uninstall", function (){
        it("should support 'uninstall' command", function (){
            assert.equal(typeof commanders.uninstall.exec, 'function');
        });
    });
    
    describe("#start", function (){
        it("should support 'start' command", function (){
            assert.equal(typeof commanders.start.exec, 'function');
        });
    });
    
    describe("#restart", function (){
        it("should support 'restart' command", function (){
            assert.equal(typeof commanders.restart.exec, 'function');
        });
    });
    
    describe("#stop", function (){
        it("should support 'stop' command", function (){
            assert.equal(typeof commanders.stop.exec, 'function');
        });
    });
    
    describe("#setLogPath", function (){
        it("should support 'setLogPath' command", function (){
            assert.equal("function", typeof fdserver.options.setLogPath.exec);
        });
    });
    
    describe("#optionsChecks", function (){
        it("noexist command should return false", function (){
            var r = fdserver.optionsChecks({
                "test_noexist_command": "test" 
            });
            assert.equal(false, r);
        });
    });
});
