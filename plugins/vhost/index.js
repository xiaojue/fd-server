/**
 * @author xiaojue[designsor@gmail.com]
 * @date 20150112
 * @fileoverview vhosts plugin for fds
 */

var vhosts = [],
routeList = {},
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
var async = require("async");

var portrange = 45032;
 
function getPort (cb) {
  var port = portrange;
  portrange += 1;
 
  var server = net.createServer();
  server.on('error', function (err) {
    getPort(cb);
  });
  server.listen(port, function (err) {
    server.once('close', function () {
      cb(port);
    });
    server.close();
  });
}

function bindStatic(fileServer, openOnlineProxy, req, res, path) {
  req.addListener('end', function() {
    var filename = fileServer.resolve(decodeURI(url.parse(req.url).pathname));
    fileServer.serve(req, res, function(err, result) {
      console.log(err);
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

function setupVhost(cb) {
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
        var file = Path.join(path, url.parse(req.url).pathname);
        /*
        //缺少rewrite规则
        if (matchProxy(req)) {
          catchProxy(req, res);
          return;
        }
        if (isNode(req) && fs.existsSync(file)) {
          runNode(file, req, res);
          return;
        }
        if (isSass(req) && fs.existsSync(file)) {
          runSass(file, req, res);
          return;
        }
        if (isLiveLoad(req)) {
          runLiveLoad(req,res);
          return;
        }
        //透明代理
        */
        bindStatic(fileServer, openOnlineProxy, req, res, path);
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
        routeList[domain] = port;
        statics.push(httpServer);
        //设置域名
        httpServer.listen(port, callback);
      });
    } else if (port) {
      //配置端口转发  
      routeList[domain] = port;
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

      if (!config.vhost) {
        config.vhost = {};
        configManager.set(config);
      }

      vhosts = [];

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

      setupVhost(cb);
    },
    stop: function(cb) {
      if(!statics.length){
        cb();
        return; 
      }
      async.each(statics,function(server,callback){
        staticsSockets.forEach(function(socket){
          socket.destroy(); 
        });
        staticsSockets = [];
        server.close(callback);
      },function(){
        statics = []; 
        cb();
      });
    }
  };
};

