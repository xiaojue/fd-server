/**
*@description 服务主线程入口
*@updateTime 2014-02-20/28 添加日志管理
*/

var exec = require('child_process').exec;
var events = require('events');
var watch = require('./watch');
var spawn = require('child_process').spawn;
var fs = require("fs");
var dns = require('dns');
var os = require('os');
var sys = os.platform();
var async = require("async");
var hosts = require("hosts-group");
var bouncy = require('bouncy');
var Path = require("path");
var nproxy = require("nproxy");
//var expr = require("./app.js");
var logger = require('../log/logger');
var config = require('../sysconfig');
var utils = require('../utils');
var util = require('util');
var configManager = require('../configManager');
var nodeStatic = require('node-static').Server;
var http = require('http');
var url = require('url');
var vm = require('vm');
var qs = require('querystring');
var request = require('request');
var listFilePath = Path.join(__dirname, "proxy_list.js");
var sass = require('node-sass');
var r = request.defaults({
  'proxy': 'http://' + config.nproxy.host + ':' + config.nproxy.port
});
var dstruc = require('dstruc');
var backupDir = Path.resolve(__dirname, '../../backup');
var fdurl = 'http://local.fd.server/';

process.setMaxListeners(0);

function openUrl(url) {
  switch (sys) {
  case "darwin":
    exec('open ' + url);
    break;
  case "win32":
    exec('start ' + url);
    break;
  default:
    spawn('xdg-open', [url]);
    break;
  }
}

function fdMaster(plugins) {
  this.pluginNames = plugins;
  this.pluginsPath = Path.resolve(__dirname, '../../', 'plugins');
  this.configManager = configManager;
  this.configPath = configManager.getPath();
  this.bouncyServer = null;
  this.routeList = {}; //域名:端口
  this.proxyServer = null;
  this.init();
}

util.inherits(fdMaster, events.EventEmitter);

utils.extend(fdMaster.prototype, {
  loadPlugins: function(plugins) {
    var mods = [],
    self = this;
    plugins.forEach(function(plugin) {
      var mod = require(Path.resolve(self.pluginsPath, plugin))(self);
      mod.name = plugin;
      mods.push(mod);
    });
    return mods;
  },
  init: function() {
    this.plugins = this.loadPlugins(this.pluginNames);
  },
  setup: function(cb) {
    var self = this;
    if (!this.isrun) {
      this.configManager.on('change', function(json, diff) {
        logger.debug("配置文件变化,开始更新服务");
        var restartServices = [];
        diff.forEach(function(item) {
          var changeName = item.path[0];
          if (self.pluginNames.indexOf(changeName) > -1) restartServices.push(changeName);
        });
        self.restart(restartServices, utils.noop);
      });
      this.configManager.on('error', function() {
        logger.error(err);
      });
      this.setupBouncy(function() {
        self.isrun = true;
        cb();
      });
    }else{
      cb(); 
    }
  },
  /*
  _batchData: function(data) {
    //初始化vhost配置数据
    this.vhosts = [];
    this.proxy = [];
    this.routeList = {};
    //私有路由-uipage port转发
    this.vhosts.push({
      port: config.uipage.port,
      openOnlineProxy: 0,
      domain: config.uipage.host,
      status: true
    });
    this.vhosts.push({
      port: config.uipage.port,
      openOnlineProxy: 0,
      domain: 'local.fd.server',
      status: true
    });
    for (var i in data.vhost) {
      var v = data.vhost[i];
      this.vhosts.push({
        openOnlineProxy: v['openOnlineProxy'],
        path: v['path'],
        domain: i,
        status: v['status']
      });
    }
    this.vhosts = utils._.filter(this.vhosts, function(item) {
      return item.status;
    });
    data.proxy = utils._.filter(data.proxy, {
      disabled: false
    });
    this.proxy = data.proxy;
    if(data.watchPath) this.watchPath = data.watchPath;
  },
  */
  reload: function(cb) {
    /*
    var self = this,
    json = utils.fileToJson(this.configPath);
    this._batchData(json);
    async.series([
    function(callback) {
      self.setupProxy(callback);
    },
    function(callback) {
      self.setupVhost(callback);
    }], cb);
    */
  },
  start: function(services, cb) {
    var self = this,
    plugins = self.plugins.filter(function(item) {
      return services.indexOf(item.name) > -1;
    });
    //要先开bouncy
    self.setup(function() {
      async.each(plugins, function(plugin, callback) {
        plugin.start(callback);
      },
      function(err) {
        if (err) {
          logger.error(err);
        } else {
          //openUrl(fdurl);
          if (cb) cb();
        }
      });
    });
    /*
    var self = this,
    json = utils.fileToJson(this.configPath);
    this._batchData(json);
    async.series([
    function(callback) {
      hosts.set(config.uipage.host, config.uipage.ip, {
        disabled: false
      });
      hosts.set('local.fd.server', config.uipage.ip, {
        disabled: false
      });
      expr.listen(config.uipage.port, callback);
    },
    function(callback) {
      self.setupProxy(callback);
    },
    function(callback) {
      self.setupVhost(callback);
    },
    function(callback) {
      self.setupBouncy(callback);
    }], function() {
      logger.info('expr proxy vhost bouncy 已启动');
      openUrl(fdurl);
      if (cb) cb();
    });
    */
  },
  stop: function(services, cb) {
    var self = this,
    plugins = self.plugins.filter(function(item) {
      return services.indexOf(item.name) > -1;
    });
    async.each(plugins, function(plugin, callback) {
      plugin.stop(callback);
    },
    function(err) {
      if (err) {
        logger.error(err);
      } else {
        logger.info('服务已关闭');
        if (cb) cb();
      }
    });
  },
  restart: function(services, cb) {
    var self = this;
    async.series([function(cb) {
      logger.info('restart stop');
      self.stop(services, cb);
    },
    function(cb) {
      logger.info('restart reload');
      self.start(services, cb);
    }], function() {
      logger.info('已重启');
      if (cb) cb();
    });
  }
  /*
  ,
  isNode: function(req) {
    return Path.extname(url.parse(req.url).pathname) == '.node';
  },
  isSass: function(req) {
    return Path.extname(url.parse(req.url).pathname) == '.scss';
  },
  isWatch:function(req){
    return req.url == '/watch';
  },
  isLiveLoad:function(req){
    return req.url == '/liveload';
  },
  runSass: function(file, req, res) {
    var dirname = Path.dirname(file);
    sass.render({
      file:file,
      success:function(css){
        res.writeHeader(200,{
          'Content-Type':'text/css' 
        });
        res.end(css); 
      },
      error:function(error){
        res.writeHeader(500,{
          'Content-Type':'text/html'  
        });
        res.end(error.toString());  
      },
      includePaths:[dirname],
      outputStyle:'nested'
    });
  },
  runNode: function(file, req, res) {
    var code = fs.readFileSync(file, 'utf-8');
    var dirname = Path.dirname(file);
    vm.runInNewContext(code, {
      logger: logger,
      Buffer: Buffer,
      '__dirname': dirname,
      addModule: function(mod) {
        return require(dirname + '/node_modules/' + mod);
      },
      require: require,
      route: function(run) {
        run(req, res);
      }
    });
  },
  readDirFile: function(req, files, dirs) {
    var responseStruc = "<a href='../'>../</a><br/>",
    path;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        path = Path.join(req.url, files[i]);
        responseStruc += '<a href="http://' + req.headers.host + path + '">' + files[i] + '</a><br/>';
      }
    }
    if (dirs) {
      for (var j = 0; j < dirs.length; j++) {
        path = Path.join(req.url, dirs[j]);
        responseStruc += '<a href ="http://' + req.headers.host + path + '/">' + dirs[j] + '/' + '</a><br/>';
      }
    }
    return responseStruc;
  },
  bindStatic: function(fileServer, openOnlineProxy, req, res, path) {
    var self = this;
    req.addListener('end', function() {
      var filename = fileServer.resolve(decodeURI(url.parse(req.url).pathname));
      fileServer.serve(req, res, function(err, result) {
        if (err && (err.status === 404)) {
          if (openOnlineProxy === 0) {
            var structure, files, dirs, flag, html;

            //查找根目录下的文件和列表
            structure = dstruc.sync(filename, {
              recursive: false,
              extensionAsKey: false
            });
            files = structure.files;
            dirs = structure.dirs;
            //此处浏览器默认查找当前路径下是否有index.html，如果有的话直接打开改页面
            if (url.parse(req.url).pathname === '/') {
              html = self.readDirFile(req, files, dirs);
              res.writeHeader(200, {
                'content-type': 'text/html'
              });
              res.end(html);
            } else if (url.parse(req.url).pathname != '/') {
              html = self.readDirFile(req, files, dirs);
              res.end(html);
            } else {
              res.writeHeader(404, {
                'content-type': 'text/html'
              });
              res.end(req.url + ' is not found');
            }
          } else {
            //本地没有文件访问线上，透明server
            dns.resolve4(req.headers.host, function(err, addresses) {
              if (err) {
                res.writeHeader(500, {
                  'content-type': 'text/html'
                });
                res.write(req.url);
                res.write(err.toString());
                res.end();
              } else {
                var ip = addresses[0];
                var p = 'http://' + ip + req.url;
                req.headers['Host'] = req.headers.host;
                request({
                  method: req.method,
                  url: p,
                  headers: req.headers
                }).pipe(res);
              }
            });
          }
        }
      });
    }).resume();
  },
  matchProxy: function(req) {
    if (fs.existsSync(listFilePath)) {
      var proxylist;
      delete require.cache[require.resolve(listFilePath)];
      proxylist = require(listFilePath);
      for (var i = 0; i < proxylist.length; i++) {
        var proxy = proxylist[i];
        var url = 'http://' + req.headers.host + req.url;
        var matched = url.match(proxy.pattern);
        if (proxy.pattern == url || matched) {
          var target = url.replace(new RegExp(proxy.pattern), proxy.responder);
          //看本地是否存在，否则会陷入代理死循环
          if ((/^http|https/).test(target)) return true;
          else {
            return fs.existsSync(target);
          }
        }
      }
    }
    return false;
  },
  catchProxy: function(req, res) {
    if (req.method == 'GET') {
      r.get('http://' + req.headers.host + req.url).pipe(res);
    } else if (req.method == 'POST') {
      var body = '';
      req.on('data', function(data) {
        body += data;
      });
      req.on('end', function() {
        r.post({
          url: 'http://' + req.headers.host + req.url,
          body: body,
          headers: req.headers
        }).pipe(res);
      });
    }
  },
  setupVhost: function(cb) {
    var self = this;
    var len = self.vhosts.length;

    if (!len) cb();
    async.each(this.vhosts, function(item, callback) {
      var path = item.path,
      port = item.port,
      openOnlineProxy = item.openOnlineProxy,
      domain = item.domain;

      if (path && fs.existsSync(path)) {
        //配置静态服务
        if (sys === 'win32') path = path.toLowerCase();
        var fileServer = new nodeStatic(path, {
          cache:3600,
          gzip: true
        });
        var httpServer = http.createServer(function(req, res) {
          process.on('uncaughtException', function(err) {
            res.writeHeader(500, {
              'content-type': 'text/html'
            });
            res.end(err.toString());
          });
          var file = Path.join(path, url.parse(req.url).pathname);
          //缺少rewrite规则
          if (self.matchProxy(req)) {
            self.catchProxy(req, res);
            return;
          }
          if (self.isNode(req) && fs.existsSync(file)) {
            self.runNode(file, req, res);
            return;
          }
          if (self.isSass(req) && fs.existsSync(file)) {
            self.runSass(file, req, res);
            return;
          }
          if (self.isLiveLoad(req)) {
            self.runLiveLoad(req,res);
            return;
          }
          //透明代理
          self.bindStatic(fileServer, openOnlineProxy, req, res, path);
        });
        httpServer.on('error', function(err) {
          logger.error(err);
        });
        httpServer.on('connection', function(socket) {
          self.staticsSockets.push(socket);
          socket.on('close', function() {
            self.staticsSockets.splice(self.staticsSockets.indexOf(socket), 1);
          });
        });
        utils.getPort(function(port) {
          self.routeList[domain] = port;
          self.statics.push(httpServer);
          //设置域名
          httpServer.listen(port, callback);
        });
      } else if (port) {
        //配置端口转发  
        self.routeList[domain] = port;
        callback();
      } else {
        logger.error(path + ' 不存在');
        callback();
      }
    },
    cb);
  },
  setupProxy: function(cb) {
    var self = this,
    listContent = "module.exports = " + JSON.stringify(this.proxy, null, 4) + ";";
    fs.writeFileSync(listFilePath, listContent);
    this.proxyServer = nproxy(config.nproxy.port, {
      "responderListFilePath": listFilePath,
      "debug": false
    });
    async.parallel({
      https: function(callback) {
        self.proxyServer['httpsServer'].on('listening', callback);
      },
      http: function(callback) {
        self.proxyServer['httpServer'].on('listening', callback);
      }
    },
    cb);
  },
  */
  ,
  addRouter: function(domain, port) {
    this.routeList[domain] = port;
  },
  clearRouter: function() {
    this.routeList = {};
  },
  deleteRouter: function(domain) {
    delete this.routeList[domain];
  },
  setupBouncy: function(cb) {
    var self = this;
    this.bouncyServer = bouncy(function(req, res, bounce) {
      var port = self.routeList[req.headers.host];
      console.log(self.routeList);
      if (port) {
        bounce(port);
      } else {
        res.statusCode = 404;
        res.end("no such host");
      }
    });
    this.bouncyServer.on("error", function(err) {
      logger.error(err);
    });
    this.bouncyServer.on("listening", cb);
    this.bouncyServer.listen(config.bouncy.port);
  }
  /*
  ,
  stopVhost: function(cb) {
    var self = this,
    len = this.statics.length;
    if (!len) cb();
    async.each(this.statics, function(server, callback) {
      self.staticsSockets.forEach(function(socket) {
        socket.destroy();
      });
      self.staticsSockets = [];
      server.close(callback);
    },
    function() {
      self.statics = [];
      cb();
    });
  },
  stopProxy: function(cb) {
    var self = this;
    if (this.proxyServer) {
      async.parallel({
        http: function(callback) {
          self.proxyServer['httpServer'].close();
          callback();
        },
        https: function(callback) {
          self.proxyServer['httpsServer'].close();
          callback();
        }
      },
      function() {
        self.proxyServer = null;
        //fs.unlinkSync(listFilePath);
        if (cb) cb();
      });
    }
  }
  */
});

module.exports = fdMaster;

