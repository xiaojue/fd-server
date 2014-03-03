# fd-server
[![Build Status](https://travis-ci.org/liuxiaoyue/express_fdserver.png?branch=master)](https://travis-ci.org/liuxiaoyue/express_fdserver) 
[![依赖模块状态](https://david-dm.org/liuxiaoyue/express_fdserver.png)](http://david-dm.org/liuxiaoyue/express_fdserver)
[![浏览数](https://sourcegraph.com/api/repos/github.com/liuxiaoyue/express_fdserver/counters/views.png?no-count)](https://sourcegraph.com/github.com/liuxiaoyue/express_fdserver)


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
    uninstall              uninstall the fd-server service

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
```
---

### 注意事项

`install` `uninstall` `stop` `start` 命令都需要管理员权限，linux or mac下使用 `sudo fd-server start` win下会有权限的窗口提醒，需要确认。 

---

### License

MIT license
