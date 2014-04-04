var server = require('../lib/server/index.js');
var assert = require('assert');

describe('index', function (){
    describe('#isNode', function(){
        it('extname should node', function (){
            var val = server.isNode({
                url:'/exec.node'
            });
            assert.ok(val); //true
        });
    });
});