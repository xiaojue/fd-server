var path = require("path");
var dir = path.join(__dirname, "../../log/");

module.exports = {
    "appenders" : [{
            "type" : "console"
        }, {
            "type" : "file",
            "filename" : dir + "all.log",
            "maxLogSize" : 2048000,
            "backups" : 3,
            "category" : ["all", "vhosts", "proxy", "operate", "console", "uipage"]
        }, {
            "type" : "file",
            "filename" : dir + "vhosts/vhosts.log",
            "maxLogSize" : 2048000,
            "backups" : 3,
            "category" : "vhosts"
        }, {
            "type" : "file",
            "filename" : dir + "proxy/proxy.log",
            "maxLogSize" : 2048000,
            "backups" : 3,
            "category" : "proxy"
        }, {
            "type" : "file",
            "filename" : dir + "operate/operate.log",
            "maxLogSize" : 2048000,
            "backups" : 3,
            "category" : "operate"
        },{
            "type" : "file",
            "filename" : dir + "uipage/uipage.log",
            "maxLogSize" : 2048000,
            "backups" : 3,
            "category" : "uipage"
        }
    ],
    "replaceConsole": true
};