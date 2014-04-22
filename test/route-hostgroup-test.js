/*
 * route index unit listing.
 */
var hostFunc = require('../lib/server/routes/hostFile.js');
var hostFile = require("hosts-group");
var assert = require('assert');
var http = require('http');
var fs = require('fs');

describe('route-hostgroup-test', function (){
    var resExtend = {
        __proto__: http.ServerResponse.prototype
    };
    resExtend.json = function(obj){};

    describe('host func all', function (){
        it('#addGroup(req, res)', function (){
            var req = {body:{type:"addGroup", data:{groupname:"testhostgroup"}}};
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['testhostgroup'].length, 0); 
            assert.ok(!!hostFile.get()['testhostgroup']);           
        }); 

        it('#editgroup(req, res)', function (){
            var req = {body:{type:"en", data:{oldname:"testhostgroup",newname:"newtestgroup"}}};
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'].length, 0); 
            assert.ok(!!hostFile.get()['newtestgroup']);               
        }); 

        it('#addrule(req, res)', function (){
            var req = {body:{type:"editrule", data:{domain:"test.host.com",ip:"127.0.0.1",disabled:false, groupname:"newtestgroup"}}}
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'][0]['ip'],'127.0.0.1');            
        }); 

        it('#editrule(req, res)', function (){
            var req = {
                body:{
                    type:"editrule", 
                    data:{
                        domain:"test.host.com",
                        ip:"127.1.1.1",
                        disabled:false,
                        groupname:"newtestgroup",
                        oldip:"127.0.0.1",
                        olddomain:"test.host.com"
                    }
                }
            };
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'][0]['ip'], '127.1.1.1');            
        });

        it('#disablerule(req, res)', function (){
            var req = {
                body:{
                    type:"disablerule", 
                    data:{
                        domain:"test.host.com",
                        ip:"127.1.1.1",
                        groupname:"newtestgroup"
                    }
                }
            };
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'][0]['disabled'], true);          
        });

        it('#activeGroup(req, res)', function (){
            var req = {body:{type:"activeGroup", data:{groupname:"newtestgroup"}}};
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'][0]['disabled'],false);            
        });  

        it('#disableGroup(req, res)', function (){
            var req = {body:{type:"disableGroup", data:{groupname:"newtestgroup"}}};
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'][0]['disabled'], true);            
        }); 

        it('#deleterule(req, res)', function (){
            var req = {body:{type:"deleterule", data:{domain:"test.host.com",ip:"127.1.1.1",groupname:"newtestgroup"}}};
            hostFunc.host(req, resExtend);
            assert.equal(hostFile.get()['newtestgroup'].length, 0);            
        }); 

        it('#removeGroup(req, res)', function (){
            var req = {body:{type:"removeGroup", data:{groupname:"newtestgroup"}}};
            hostFunc.host(req, resExtend);
            assert.ok(!hostFile.get()['newtestgroup']);            
        }); 
    });
});