/**
*@description 服务主线程入口
*@updateTime 2014-02-20/28 添加日志管理
*/

var exec = require('child_process').exec;
var events = require('events');
var spawn = require('child_process').spawn;
var os = require('os');
var sys = os.platform();
var async = require("async");
var hosts = require("hosts-group");
var bouncy = require('bouncy');
var Path = require("path");
//var expr = require("./app.js");
var logger = require('../log/logger');
var utils = require('../utils');
var util = require('util');
var configManager = require('../configManager');
var config = configManager.sysconfig;
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
  this.logger = logger;
  this.utils = utils;
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
  },
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
});

module.exports = fdMaster;

