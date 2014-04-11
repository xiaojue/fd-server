var spawn = require('child_process').spawn;
var os = require('os');
var sys = os.platform();
var child;
if (sys === 'win32') {
	child = spawn('npm',['install','node-windows','-g']);
} else if (sys == 'linux') {
	child = spawn('npm',['install','git://github.com/xiaojue/node-linux.git#5bd49b078e3342752ed14642e78922ac2cab27ba','-g']);
} else if (sys == 'darwin') {
	child = spawn('npm',['install','node-mac','-g']);
}
child.stdout.on('data', function(data) {
	console.log(data.toString());
});

