var util = require("util");
var events = require("events");

function listener() {
    events.EventEmitter.call(this);
}

module.exports = listener;

util.inherits(listener, events.EventEmitter);

listener.prototype.notice = function(data) {
    this.emit("data", data);
}

