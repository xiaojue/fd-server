var os = require('os');
var platform = os.platform();
var exec = require('child_process').exec;


function endInstall(err,stdout,stderr){
	if(error){
		console.log(err);	
	}
}

if(platform == 'linux'){
	exec('npm install node-linux');	
}else if(platform == 'win32'){
	exec('npm install node-windows');	
}else if(platform == 'darwin'){
	exec('npm install node-mac');	
}
