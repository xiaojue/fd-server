
/*
 * GET users listing.
 */

exports.list = function(req, res){
	var url = require('url');
	var util = require('util');
	var queryObj = url.parse(req.url,true).query;  
	

	function saveServer(srcUrl, urlTo){
		res.send(queryObj.srcUrl + '(\'{"message": "test"}\')');	
	}
	
	saveServer(queryObj.srcUrl, queryObj.urlTo);	
};
