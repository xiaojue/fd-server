var bouncy = require('bouncy');
var fs = require("fs");

var server = null;
function route(data){
    if(server){
        server.close(function (){
            console.log("close route: " + arguments);
        });
    }
    server = bouncy(function (req, res, bounce){
        var port = data[req.headers.host];
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

function start(routes){
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
}

exports.start = start;