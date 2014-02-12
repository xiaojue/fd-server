var bouncy = require('bouncy');
var fs = require("fs");

function route(type, options){
    var fn = {
        "start": start,
        "close": close,
        "add": add,
        "remove": remove
    };
    
    fn[type] && fn[type](options);

    /* if(type === "start"){
        options && options["routes"] && start(options["routes"]);
    }
    
    if(type === "close"){
        close();
    } */
}

var server = null;
var routeList = {};

function start(options){
    routeList = options["list"];
    if(server){
        server.close(function (){
            console.log("close route (restart): " + arguments);
        });
    }
    server = bouncy(function (req, res, bounce){
        var port = routeList[req.headers.host];
        console.log("route: "+req.headers.host);
        if(port){
            console.log("route: "+port);
            bounce(port);
        }else{
            res.statusCode = 404;
            res.end("no such host");
        }
    });
    server.listen(80);
}

//添加指定的domain指向
function add(options){
    var port = options.port;
    var domain = options.domain;
    var _port = routeList[domain];
    if(_port && _port == port){
        return;
    }
    routeList[domain] = port;
    start(routeList);
}

//移除指定的domain指向
function remove(options){
    var domain = options.domain;
    if(routeList[domain]){
        delete routeList[domain];
        start(routeList);
    }
}

function close(){
    server && server.close(function (){
        console.log("close route: " + arguments);
        routeList = {};
    });
    routeList = {};
}

/* function start(routes){
    if(routes){
        route(routes);
    }else{
        fs.exists("./routes.json", function (t){
            if(t){
                fs.readFile(path, function (err, data){
                    if(err){
                        throw err;
                    }
                    eval('var obj = ' + data);
                    route(obj);
                })
            }else{
                console.warn("file not found. " + path);
                // callback(null);
            }
        });
    }
} */

process.on("message", function (m){
    route(m.type, m.options);
});

exports.route = route;