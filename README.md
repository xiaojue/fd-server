# fd-server
[![Build Status](https://travis-ci.org/SinaBlogFE/fd-server.png?branch=master)](https://travis-ci.org/SinaBlogFE/fd-server) 
[![依赖模块状态](https://david-dm.org/SinaBlogFE/fd-server.png)](http://david-dm.org/SinaBlogFE/fd-server)
[![浏览数](https://sourcegraph.com/api/repos/github.com/SinaBlogFE/fd-server/counters/views.png?no-count)](https://sourcegraph.com/github.com/SinaBlogFE/fd-server)


fd-server 是一个多功能的前端开发环境，它支持以下几大功能，快速建立静态服务，代理服务，hosts分组以及动态接口的扩展。且跨平台可在win，linux，mac平台上以命令行方式运行,并注册到系统服务中。

---

### 下载安装

[安装wiki](https://github.com/SinaBlogFE/fd-server/wiki/fd-server-install)

---

### 命令行工具

```bash
$ fd-server -h

  Usage: fd-server [command]

  Commands:

    start                  start the fd-server server
    stop                   stop the fd-server server
    restart                restart the fd-server server

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
```

---

### 快速上手

安装成功后，使用start命令开启服务。

```bash
$ sudo fd-server start
```
启动完成之后可访问 `http://fd.server` 访问服务配置页面。

[浏览器代理配置帮助](https://github.com/liuxiaoyue/fd-server/wiki/%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BB%A3%E7%90%86)

### 扩展接口

有的时候我们往往需要模拟一些后端接口，或者做一些动态解析的功能，或者扩展动态路由。fd-server支持给vhost的静态服务扩展路由。
只需要在静态目录下放置 `.node` 的扩展名文件，代码书写如下：

```javascript
//someroute.node
route(function(req,res){
   res.writeHead(200,{'Content-Type':'text/plain'});
   res.end('someroute');
});
```
那么当你访问对应host域名下得`/someroute.node`地址则会自动转入当前文件的route函数路由中，可随意扩展。

---
### 注意事项

`stop` `start` `restart` 命令都需要管理员权限，linux or mac下使用 `sudo fd-server start` win下会有权限的窗口提醒，需要确认。 

---

### License

MIT license
