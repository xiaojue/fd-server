
/**
 * Module dependencies.
 */
var fs = require('fs');
//express 基础框架
var express = require('express');
var routes = require('./routes');
var showlog = require('./routes/showlog');
var exportFile = require('./routes/export');
var importFile = require('./routes/import');
var hostFile = require('./routes/hostFile');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.resolve(__dirname,'views'));
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
	//提供静态文件支持
	app.use(express['static'](path.resolve(__dirname,'public')));
	//提供路由支持
	app.use(app.router);
	// app.use(express.router(routes));
});

app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/log', showlog.show);
app.get('/export.json', exportFile.show);
app.post('/import.json', importFile.show);
//app.post('/saveHosts', saveHosts.list);
app.post('/hostFile', hostFile.host);

app.get('/scope', routes.scope);
app.post('/scope', routes.save);
app.post('/removeHost', routes.removeHost);
app.post('/toggleHost', routes.toggleHost);
app.post('/removeGroup', routes.removeGroup);
app.post('/editProxy', routes.editProxy);
app.post('/editProxyGroup', routes.editProxyGroup);
app.post('/removeProxy', routes.removeProxy);
app.post('/disabledProxy', routes.disabledProxy);
app.post('/toggleOnlineProxy', routes.onlineProxy);

app.get('*', function(req, res){
    res.render('404', {
        title: 'No Found'
    });
});

//供外部调用打开端口
module.exports = app;
