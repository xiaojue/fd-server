define('config',function(require,exports,module){
	// test
	var config = {
		base:'js/',
		//it will replace the real BASEPATH
		//for debug or update timestamp ? All javascript modules will be used
		alias:{
			'lib':'lib/core/chaos/jquery'
		}
	};

	module.exports = config;
});

