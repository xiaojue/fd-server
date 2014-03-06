
/**
 * Module dependencies.
 */
var fs = require('fs');
//express 基础框架
var express = require('express');
var routes = require('../routes');
var saveHosts = require('../routes/saveHosts');
var showlog = require('../routes/showlog');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.resolve(__dirname,'../','views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.json());
	app.use(express.urlencoded());
	//解析客户端请求，通常是通过post发过来的请求
	app.use(express.bodyParser());
	//用于支持定制的http方法
	app.use(express.methodOverride());
	//支持flash
	app.use(flash());
	//提供路由支持
	app.use(app.router);
	// app.use(express.router(routes));
	//提供静态文件支持
	app.use(express.static(path.resolve(__dirname,'../','public')));
})
//开发环境
app.configure('development', function(){
	
})
//生产环境
app.configure('production', function(){

})

app.get('/index', routes.index);
app.get('/log', showlog.show);
app.post('/saveHosts', saveHosts.list);

//供外部调用打开端口
module.exports = app;

if(!module.parent){
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}


