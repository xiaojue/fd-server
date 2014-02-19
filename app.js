
/**
 * Module dependencies.
 */
//产品环境下创建访问日志，错误日志，不让程序中断
var fs = require('fs');
// var accessLogfile = fs.createWriteStream('access.log', {flags : 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags : 'a'});

//express 基础框架
var express = require('express');
var routes = require('./routes');
var saveHosts = require('./routes/saveHosts');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var app = express();

// all environments
app.configure(function(){
	// app.use(express.logger({stream : accessLogfile}));
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	//解析客户端请求，通常是通过post发过来的请求
	app.use(express.bodyParser());
	//用于支持定制的http方法
	app.use(express.methodOverride());
	//支持flash
	app.use(flash());
	//用于cookie解析的中间键
	app.use(express.cookieParser());
	//提供路由支持
	app.use(app.router);
	// app.use(express.router(routes));
	//提供静态文件支持
	app.use(express.static(path.join(__dirname, 'public')));
})
//开发环境
app.configure('development', function(){
	
})
//生产环境
app.configure('production', function(){
	app.error(function(err, req, res, next){
		var meta = '[' + new Date() + ']' + req.url + '\n';
		errorLogfile.write(meta + err.stack + '\n');
		next();
	});
})

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/index', routes.index);
app.post('/saveHosts', saveHosts.list);

//供外部调用打开端口
module.exports = app;

if(!module.parent){
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}


