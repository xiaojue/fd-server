define('config',function(require,exports,module){
	// test
	var config = {
		//it will replace the real BASEPATH
		//for debug or update timestamp ? All javascript modules will be used
		alias:{
			'$':'lib/jquery-1.11.0.min.js',
			'jquery-ui':'common/jquery-ui-1.10.3.custom.min.js',
			'bootstrap':'common/bootstrap.min.js',
			'select':'common/bootstrap-select.js',
			'switch':'common/bootstrap-switch.js',
			'checkbox':'common/flatui-checkbox.js',
            'io':'lib/socket.io.min.js'
		}
	};

	module.exports = config;
});

