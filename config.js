{
	"vhost": {
		"sjs.sinajs.cn": "/Users/chenchen/fuqiang/dev/",
		"c.blog.sina.com.cn": "/Users/chenchen/fuqiang/dev/newcblog/",
		"a.com": "/Users/chenche/fuqiang/dev/"
	},
	"proxy": [{
		"pattern": "http://sjs.sinajs.cn/newcblog/assest/(.*?)$",
		"responder": "http://sjs.sinajs.cn/newcblog/src/$1"
	}],
	"port": 8989
}

