/*
 *vhost 配置文件的变更 
 *
*/

var assert = require('assert');
var fs = require('fs');
var utils = require('../lib/utils');
var path = require('path');
var hosts = require('hosts-group');
var http = require('http');

//注意：还未完成  暂时先提交吧.........

describe('vhost server', function (){
    describe('#vhost', function(){
    	this.timeout(10000);
        it('vhost server start', function (done){
        	var url = path.join(__dirname, "../config.json");
			var confStr = fs.readFileSync(url,'utf-8');
			var data = JSON.parse(confStr);
			setTimeout(function() {
				//todo  路径改成当前项目路径
				data['vhost']['test.com'] = {'path':'d:\\workspace' ,'status':true};
				fs.writeFileSync(url,JSON.stringify(data),'utf-8');
			},1000);
			setTimeout(function() {
				hosts.set('test.com','127.0.0.1','testgroup');
			},5000);

			//此处创建http服务 判断状态吗
			//todolist..........

			setTimeout(done,8000)
			assert.ok(true);
        });
    });
});