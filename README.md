# fd-server
[![Build Status](https://travis-ci.org/liuxiaoyue/fd-server.png?branch=master)](https://travis-ci.org/liuxiaoyue/fd-server) 
[![依赖模块状态](https://david-dm.org/liuxiaoyue/fd-server.png)](http://david-dm.org/liuxiaoyue/fd-server)
[![浏览数](https://sourcegraph.com/api/repos/github.com/liuxiaoyue/fd-server/counters/views.png?no-count)](https://sourcegraph.com/github.com/liuxiaoyue/fd-server)


fd-server 是一个多功能的前端开发环境，它支持以下几大功能，快速建立静态服务，代理服务，hosts分组以及动态接口的扩展。且夸平台可在win，linux，mac平台上以命令行方式运行。

---

### 下载安装

```bash
$ npm install fd-server -g
$ sudo fd-server install
```

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
    
```

---
###日志管理
使用[log4js](https://github.com/nomiddlename/log4js-node)统一管理，日志文件存放于项目跟目录的log文件夹下。

- log：日志文件根目录
 - vhosts：存放静态服务运行日志目录 
 - proxy：存放代理服务运行日志目录
 - operate：存放服务操作控制相关的日志目录
 - uipage：express模块日志
 - all.log

log目录下的all.log文件将存放所有类别的日志信息。

`日志文件夹会在运行时自己创建`

---
### 注意事项

`install` `uninstall` `stop` `start` `restart` 命令都需要管理员权限，linux or mac下使用 `sudo fd-server start` win下会有权限的窗口提醒，需要确认。 

---

### License

MIT license
