# 快速上手

- template: page
- pubdate: 2014-04-18

-----------

这里将介绍如何快速使用fds开始你的前端开发工作，并使你可以独立开发动态扩展。

下图为使用fds一个总的开发流程:

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/fds.png)

下面以一个简单的hello world项目为事例，开始上手fds。

```bash
git clone https://github.com/litheModule/litheExample
cd litheExample/
npm install -d
```

安装完依赖，使用grunt 命令可以进行打包操作，更多关于grunt和lithe的使用方法可查看我们的另外一个开源项目lithe的文档: https://github.com/litheModule/lithe

下面简单介绍下demo的目录结构：

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/src.png)

此目录为开发目录，放置松散的开发模块。

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/assest.png)

此目录为上线目录，放置grunt合并打包过后的文件。

下面进入fd.server 开始配置vhost，proxy和hosts，分别如图：

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/vhost.png)
![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/proxy.png)
![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/hosts.png)

就是这么简答，配置完成了本地的项目环境！

访问项目地址: http://lithe.example/app.html

勾选proxy规则时得请求如下：

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/dev.png)

不勾选规则时请求如下:

![](https://raw.githubusercontent.com/SinaBlogFE/fd-server/gh-pages/img/online.png)

当然这只是一个简单的例子。

更多高级用法详见其它例子文章。
