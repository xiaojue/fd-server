/**
 * @author xiaojue[designsor@gmail.com]
 * @date 20150112
 * @fileoverview vhosts plugin for fds
 */

var vhosts = [],
statics = [],
staticsSockets = [];

var nodeStatic = require('node-static').Server;
var net = require('net');
var os = require('os');
var fs = require('fs');
var sys = os.platform();
var http = require('http');
var url = require('url');
var Path = require("path");
var dns = require("dns");
var request = require('request');
var dstruc = require('dstruc');
var async = require("async");
var vm = require('vm');
var qs = require('querystring');
var sass = require('node-sass');
var logger = require('../../lib/log/logger');
var r;

var portrange = 45032;

function getPort(cb) {
  var port = portrange;
  portrange += 1;

  var server = net.createServer();
  server.on('error', function(err) {
    getPort(cb);
  });
  server.listen(port, function(err) {
    server.once('close', function() {
      cb(port);
    });
    server.close();
  });
}

function matchProxy(fds,req) {
    var proxylist = fds.configManager.getJson().proxy;
    for (var i = 0; i < proxylist.length; i++) {
      var proxy = proxylist[i];
      if(proxy.disabled) continue;
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
  return false;
}
function catchProxy(req, res) {
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
}
function isNode(req) {
  return Path.extname(url.parse(req.url).pathname) == '.node';
}
function isSass(req) {
  return Path.extname(url.parse(req.url).pathname) == '.scss';
}

function runSass(file, req, res) {
  var dirname = Path.dirname(file);
  sass.render({
    file: file,
    success: function(css) {
      res.writeHeader(200, {
        'Content-Type': 'text/css'
      });
      res.end(css);
    },
    error: function(error) {
      res.writeHeader(500, {
        'Content-Type': 'text/html'
      });
      res.end(error.toString());
    },
    includePaths: [dirname],
    outputStyle: 'nested'
  });
}
function runNode(file, req, res) {
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
}
function readDirFile(req, files, dirs) {
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
}

function bindStatic(fileServer, openOnlineProxy, req, res, path,fds) {
  req.addListener('end', function() {
    var filename = fileServer.resolve(decodeURI(url.parse(req.url).pathname));
    //缺少rewrite规则
    if (matchProxy(fds,req)) {
      catchProxy(req, res);
      return;
    }
    if (isNode(req) && fs.existsSync(filename)) {
      runNode(filename, req, res);
      return;
    }
    if (isSass(req) && fs.existsSync(filename)) {
      runSass(filename, req, res);
      return;
    }
    /*
    if (isLiveLoad(req)) {
      runLiveLoad(req, res);
      return;
    }
    */
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
            html = readDirFile(req, files, dirs);
            res.writeHeader(200, {
              'content-type': 'text/html'
            });
            res.end(html);
          } else if (url.parse(req.url).pathname != '/') {
            html = readDirFile(req, files, dirs);
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
}

function setupVhost(fds, cb) {
  var len = vhosts.length;
  if (!len) {
    cb();
    return;
  }
  async.each(vhosts, function(item, callback) {
    var path = item.path,
    port = item.port,
    openOnlineProxy = item.openOnlineProxy,
    domain = item.domain;
    if (path && fs.existsSync(path)) {
      //配置静态服务
      if (sys === 'win32') path = path.toLowerCase();
      var fileServer = new nodeStatic(path, {
        cache: 3600,
        gzip: true
      });
      var httpServer = http.createServer(function(req, res) {
        process.on('uncaughtException', function(err) {
          res.writeHeader(500, {
            'content-type': 'text/html'
          });
          res.end(err.toString());
        });
        bindStatic(fileServer, openOnlineProxy, req, res, path,fds);
      });
      httpServer.on('error', function(err) {
        logger.error(err);
      });
      httpServer.on('connection', function(socket) {
        staticsSockets.push(socket);
        socket.on('close', function() {
          staticsSockets.splice(staticsSockets.indexOf(socket), 1);
        });
      });
      getPort(function(port) {
        fds.addRouter(domain, port);
        statics.push(httpServer);
        //设置域名
        httpServer.listen(port, callback);
      });
    } else if (port) {
      //配置端口转发  
      fds.addRouter(domain, port);
      callback();
    } else {
      logger.error(path + ' 不存在');
      callback();
    }
  },
  cb);
}

module.exports = function(fds) {
  return {
    start: function(cb) {
      var configManager = fds.configManager;
      var config = configManager.getJson();
      var sysconfig = configManager.sysconfig;
      r = request.defaults({
        'proxy': 'http://' + sysconfig.nproxy.host + ':' + sysconfig.nproxy.port
      });

      if (!config.vhost) {
        config.vhost = {};
        configManager.set(config);
      }

      vhosts = [];
      fds.clearRouter();

      for (var i in config.vhost) {
        var v = config.vhost[i];
        vhosts.push({
          openOnlineProxy: v['openOnlineProxy'],
          path: v['path'],
          domain: i,
          status: v['status']
        });
      }

      vhosts = vhosts.filter(function(item) {
        return item.status;
      });
      setupVhost(fds, cb);
    },
    stop: function(cb) {
      if (!statics.length) {
        cb();
        return;
      }
      async.each(statics, function(server, callback) {
        staticsSockets.forEach(function(socket) {
          socket.destroy();
        });
        staticsSockets = [];
        server.close(callback);
      },
      function() {
        statics = [];
        cb();
      });
    }
  };
};

