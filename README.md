# fd-server
[![Build Status](https://travis-ci.org/SBFE/fd-server.png?branch=master)](https://travis-ci.org/SBFE/fd-server) 
[![NPM Version](http://img.shields.io/npm/v/fd-server.svg?style=flat)](https://www.npmjs.org/package/fd-server)
[![依赖模块状态](https://david-dm.org/SBFE/fd-server.png)](http://david-dm.org/SBFE/fd-server)
[![浏览数](https://sourcegraph.com/api/repos/github.com/SBFE/fd-server/counters/views.png?no-count)](https://sourcegraph.com/github.com/SBFE/fd-server)


Fds 是一套统一的本地开发环境，面向工程化的前端开发项目。简化开发人员生产时对服务配置的依赖，提高前端开发人员的开发效率。面向自动化的项目流程管理，交付，测试。减少复杂的人工操作。自身包含的扩展机制，也能够提供给开发者灵活多变的个性化服务定制方案, 同时Fds也是一套跨平台的本地开发环境，完美支持win,linux,mac os。

---

### 下载安装

[安装wiki](https://github.com/SBFE/fd-server/wiki/fd-server-install)

---

### 命令行工具

```bash
$ fd-server -h

  Usage: fd-server [command]

  Commands:

    start                  start the fd-server server
    startDaemon            start with daemon
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

[浏览器代理配置帮助](https://github.com/SEFB/fd-server/wiki/%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BB%A3%E7%90%86)

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

`startDaemon` `stop` `start` `restart` 命令都需要管理员权限，linux or mac下使用 `sudo fd-server start` win下会有权限的窗口提醒，需要确认。 

---
### 贡献
```
 project  : fd-server
 repo age : 10 months
 active   : 65 days
 commits  : 404
 files    : 158
 authors  : 
   127  fu                      31.4%
    79  RK-WJW                  19.6%
    70  liuxiaoyue              17.3%
    59  xiaojue                 14.6%
    46  Your Name               11.4%
    19  Xiaojue                 4.7%
     2  RK_CODER                0.5%
     1  myluluy                 0.2%
     1  root                    0.2%
```
---

### License

MIT license
