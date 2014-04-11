var sudo = require('sudo');
var os = require('os');
var sys = os.platform();
var options = {
	cachePassword: true,
	prompt: 'need password for sudo?'
};
var child;
if (sys === 'win32') {
	child = sudo(['npm','install','node-windows'], options);
} else if (sys == 'linux') {
	child = sudo(['npm','install','git://github.com/xiaojue/node-linux.git#5bd49b078e3342752ed14642e78922ac2cab27ba'], options);
} else if (sys == 'darwin') {
	child = sudo(['npm','install','node-mac'], options);
}
child.stdout.on('data', function(data) {
	console.log(data.toString());
});

