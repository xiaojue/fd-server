
/*
 * GET users listing.
 */

exports.list = function(req, res){
	var url = require('url');
	var util = require('util');
	var User = require('../models/user.js');
	var hostile = require('hostile');
	var queryObj = url.parse(req.url,true).query;  
	

  	// var newUser = new User({
  	// 	srcUrl : queryObj.srcUrl,
  	// 	urlTo : queryObj.urlTo
  	// })
	function saveServer(srcUrl, urlTo){
		res.send(queryObj.srcUrl + '(\'{"message": "test"}\')');
		// db.serialize(function() {
		// 	db.run("CREATE TABLE fdserver_data (info TEXT)");

		// 	var stmt = db.prepare("INSERT INTO fdserver_data VALUES (?,?)");
		//     stmt.run([srcUrl, urlTo]);
		//   	stmt.finalize();

		//  	db.each("SELECT rowid AS id, info FROM fdserver_data", function(err, row) {
		//       	console.log(row.id + ": " + row.info);
		//   	});
		//   	res.send(queryObj.srcUrl + '(\'{"message": "test"}\')');
		// });

		// db.close();
	}
	saveServer(queryObj.srcUrl, queryObj.urlTo);

  	//检查是否已经存过host
	// User.get(newUser.srcUrl, function(err, user) {
	// 	if (user)
	// 	err = 'rule already exists.';

	// 	if (err) {
	// 		req.flash('error', err);
	// 		return res.redirect('/');
	// 	}
	// 	//如果不存在则新增用户
	// 	newUser.save(function(err){
	// 		if (err) {
	// 			req.flash('error', err);
	// 			return res.redirect('/');
	// 		}
	// 		req.session.user = newUser;
	// 		hostile.set('127.0.0.1', queryObj.srcUrl, function (err) {
	// 			console.log('ssssssssssssss')
	// 		  	if (err) {
	// 		    	console.error(err)
	// 		  	} else {
	// 		    	console.log('set /etc/hosts successfully!')
	// 		  	}
	// 		})
	// 		res.send(queryObj.srcUrl + '(\'{"message": "test"}\')');
	// 		req.flash('success', '保存成功');
	// 		// res.redirect('/');
	// 	});
	// });
};
