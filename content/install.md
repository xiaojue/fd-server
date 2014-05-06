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
cnpm install fd-server -g
```

#### 4.2 mac,ubunt,linux下安装过程：

```bash
sudo cnpm install fd-server -g
```

#### 5.启动fd-server服务

```bash
sudo fd-server start
```

之后打开浏览器访问http://fd.server 进行配置即可！
