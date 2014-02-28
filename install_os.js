var os = require('os');
var platform = os.platform();
var cp = require('child_process');
var cmd;

if (platform == 'linux') {
	cmd = cp.exec('npm install node-linux');
} else if (platform == 'win32') {
	cmd = cp.exec('npm install node-windows');
} else if (platform == 'darwin') {
	cmd = cp.exec('npm install node-mac');
}

cmd.stdout.on('data', function(data) {
	console.log(data);
});

cmd.stderr.on('data', function(data) {
	console.log(data);
});
