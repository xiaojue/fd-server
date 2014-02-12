var nproxy = require("nproxy");


nproxy(80, {
  "responderListFilePath": [{
        pattern: 'E:/images/20138111185866887.jpg',      // Match url you wanna replace
        responder:  "http://i3.sinaimg.cn/blog/main/index2012/blog_yan_t1.gif"
  }],
  "timeout": 10,
  "debug": true,
});