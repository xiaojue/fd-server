var fdserver = require('../lib/commanders.js');
var assert = require('assert');
var commanders = fdserver.commanders;

describe("commanders" , function (){
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
    
});
