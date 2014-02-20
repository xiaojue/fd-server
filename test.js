var server = require("./server");
var expr = require("./app.js");
var appconfig = {
    port: 3000,
    domain: "www.sina-fds.com"
};

expr.listen(appconfig.port);
server.start({
    configFile: "config.json",
    appHost: appconfig
});