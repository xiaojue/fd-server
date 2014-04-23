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

    install                install the fd-server service
    start                  start the fd-server server
    stop                   stop the fd-server server
    restart                restart the fd-server server
    uninstall              uninstall the fd-server service

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -l, --log [path]  Set Log Path
    
```

---

### 快速上手

安装成功后，使用start命令开启服务。

```bash
$ sudo fd-server start
```
启动完成之后可访问 `http://fd.server` 访问服务配置页面。

[浏览器代理配置帮助](https://github.com/liuxiaoyue/fd-server/wiki/%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BB%A3%E7%90%86)

---
### 日志管理
使用[log4js](https://github.com/nomiddlename/log4js-node)统一管理，日志文件存放于项目跟目录的log文件夹下。

- log：日志文件根目录
 - vhosts：存放静态服务运行日志目录 
 - proxy：存放代理服务运行日志目录
 - operate：存放服务操作控制相关的日志目录
 - uipage：express模块日志
 - all.log

`日志文件夹会在运行时自己创建`

log目录下的all.log文件将存放所有类别的日志信息。    
查看日志可通过`http://www.sina-fds.com/log`访问查看，前提要先启动服务，或者直接到日志目录通过文件查看。    
需要修改日志路径可通过下面命令：   
```bash
$ fd-server -l path
```   

---

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

`install` `uninstall` `stop` `start` `restart` 命令都需要管理员权限，linux or mac下使用 `sudo fd-server start` win下会有权限的窗口提醒，需要确认。 

---

### License

MIT license
