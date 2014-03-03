var server = require("./index.js");

var options = {
    appPort: 3003,
    appHost: "www.sina-fds.com",
    configFilePath: require("path").join(__dirname, "../config.json")
};

//options可选，不指定时，默认就是上面的配置。
server.start(options);
