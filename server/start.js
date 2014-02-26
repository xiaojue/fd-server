var Service = require('./systemService.js');
var http = require("http");

// var scriptPath = path.resolve(__dirname, "server.js");
// console.log("__dirname: " + __dirname);
// console.log("cwd: " + process.cwd());
var options = {
    name: "Fdserver11111",
    description: "The nodejs web server. express_fdserver. ",
    script: __dirname + "\\sys.js"
};

// var type = process.argv[2] || "r";

// if(type === "r"){
//     Service.register(options);
// }else{
//     Service.remove(options);
// }

function start(){
    Service.getService(options, function (svc){
        svc.start();
        http.get("http://127.0.0.1:8123/?type=start");
    });
}

function stop(){
    http.get("http://127.0.0.1:8123/?type=stop");
}

function remove(){
    Service.remove(options);
}
module.exports = {
	start : start,
	stop :stop,
	remove:remove
}