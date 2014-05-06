# 文档

- template: page
- pubdate: 2014-04-18

-----------

fds 简化了开发者对命令行和配置文件的依赖，很多功能都可以web管理界面中直接操作完成配置。

所以文档只包括三个方面：

1. 命令行工具的使用。
2. 日志管理和调试。
3. 如何编写.node扩展。

#### 命令行工具

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
    -l, --log [path]  Set Log Path

```

---

---

#### 扩展接口

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

[浏览器代理配置帮助](https://github.com/liuxiaoyue/fd-server/wiki/%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%BB%A3%E7%90%86)

---
