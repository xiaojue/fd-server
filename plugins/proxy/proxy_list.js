module.exports = [
    {
        "pattern": "http://shine.mask.mp.sina.com.cn/js/shine/js/sharedl.js",
        "responder": "E:\\workspace\\sina_lxy\\H5\\dist\\js\\sharedl.js",
        "disabled": false,
        "group": "t"
    },
    {
        "pattern": "http:\\/\\/shine\\.mask\\.mp\\.sina\\.com\\.cn/h5\\/(.*)",
        "responder": "E:\\workspace\\sina_lxy\\H5\\$1",
        "disabled": false,
        "group": "积分"
    },
    {
        "pattern": "http:\\/\\/huayangjs\\.sinaapp\\.com\\/(.*)",
        "responder": "http://sjs.sinajs.cn/products/yimei/$1",
        "disabled": false,
        "group": "积分"
    }
];