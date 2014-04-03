define('config',function(require,exports,module){
	// test
	var config = {
		//it will replace the real BASEPATH
		//for debug or update timestamp ? All javascript modules will be used
		alias:{
			'$':'lib/jquery-1.11.0.min.js'
		}
	};

	module.exports = config;
});

