var path = require("path");
var dir = path.join(__dirname, "../../log/");

module.exports = {
    "appenders" : [{
            "type" : "console"
        }, {
            "type" : "file",
            "filename" : dir + "all.log",
            "maxLogSize" : 20480,
            "backups" : 3,
            "category" : ["all", "vhosts", "proxy", "operate", "console"]
        }, {
            "type" : "file",
            "filename" : dir + "vhosts/vhosts.log",
            "maxLogSize" : 20480,
            "backups" : 3,
            "category" : "vhosts"
        }, {
            "type" : "file",
            "filename" : dir + "proxy/proxy.log",
            "maxLogSize" : 20480,
            "backups" : 3,
            "category" : "proxy"
        }, {
            "type" : "file",
            "filename" : dir + "operate/operate.log",
            "maxLogSize" : 20480,
            "backups" : 3,
            "category" : "operate"
        }
    ],
    "replaceConsole": true
};