var gaze = require('gaze');

function fdwatch(){
	this.watch = null;
	this.changed = false;
}

fdwatch.prototype = {
	constructor:fdwatch,
	start:function(){
		var self = this;
		this.watch = new gaze();	
		this.watch.add(self.files);
		this.watch.on('changed',function(filepath){
			self.changed = true;
		});
	},
	setfiles:function(files){
		if(this.watch){
			this.watch.close();
			this.changed = false;
		}
		this.files = files;	
		this.start();
	},
	getStatus:function(){
		if(this.changed){
			this.changed = false;
			return true;
		}else{
			return false;	
		}
	}
};
module.exports = new fdwatch();
