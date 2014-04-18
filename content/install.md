# 安装 FdServer

- template: page
- pubdate: 2014-04-18

-----------

#### node版本需要在0.10以上

http://nodejs.org/download/

#### 1.安装cnpm加快安装速度(可选，npm速度快的可不用)

```bash
npm install -g cnpm --registry=http://r.cnpmjs.org
```

#### 2.安装git命令行工具

##### windows

http://msysgit.github.io/

##### ubuntu

```bash
sudo apt-get install git
```

##### mac

```
sudo brew install git
```

#### 3.修改github的hosts，防止git clone时报错

```bash
192.30.252.131 github.com
```

#### 4.1 windows下安装过程：

1. 管理员身份运行cmd。
2. cnpm下载fd-server和windows依赖。
```bash
cnpm install node-windows -g
cnpm install fd-server -g
```

#### 4.2 mac下安装过程：

```bash
sudo cnpm install node-mac -g
sudo cnpm install fd-server -g
```

#### 4.3 ubuntu下或者其他linux版本安装：

1. 下载源码.
```bash
git clone https://github.com/liuxiaoyue/fd-server
cd fd-server
```
2. 手动安装.
```bash
sudo node install.js
cnpm install -g
```

3. 如果使用debian系统，安装后报`start-stop-daemon command not found`错误，则需要手动安装`start-stop-daemon`命令。

```bash
$ wget http://developer.axis.com/download/distribution/apps-sys-utils-start-stop-daemon-IR1_9_18-2.tar.gz
$ tar zxf apps-sys-utils-start-stop-daemon-IR1_9_18-2.tar.gz
$ mv apps/sys-utils/start-stop-daemon-IR1_9_18-2/ ./
$ rm -rf apps
$ cd start-stop-daemon-IR1_9_18-2/
$ cc start-stop-daemon.c -o start-stop-daemon
$ cp start-stop-daemon /usr/local/bin/start-stop-daemon
```

#### 5.启动fd-server服务

```bash
sudo fd-server install
sudo fd-server start
```

之后打开浏览器访问http://fd.server 进行配置即可！
