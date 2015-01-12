var socket = require('socket.io');

var buffer = {};
function taskSocket(){
    this.port = 54321;
    this.init();
}

taskSocket.prototype = {
  constructor: taskSocket,
    init: function (){
        var io = socket.listen(this.port);
        io.sockets.on('connection', function (socket) {
            socket.emit('ok', 1);
            var clear;
            socket.on("key", function (key){
                var timer = setInterval(function(){
                    var bf = buffer[key];
                    if(bf && bf.length > 0){
                        socket.emit('data', bf.splice(0).join(""));
                    }
                },1000);
                clear = function (){
                    clearInterval(timer);
                    delete buffer[key];
                };
            });
            socket.on('disconnect', function (){
                clear && clear();
            });
        });
    },
    send: function (data, key){
        var bf = buffer[key] = buffer[key] || [];
        bf.push(data);
    }
};

module.exports = new taskSocket();
