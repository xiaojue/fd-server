
/*
 * GET users listing.
 */

exports.list = function(req, res){
	var url = require('url');
	var util = require('util');
	var User = require('../models/user.js');
	var queryObj = url.parse(req.url,true).query;  
	

  	var newUser = new User({
  		srcUrl : queryObj.srcUrl,
  		urlTo : queryObj.urlTo
  	})

  	//检查是否已经存过host
	User.get(newUser.srcUrl, function(err, user) {
		if (user)
		err = 'rule already exists.';

		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		//如果不存在则新增用户
		newUser.save(function(err){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});




 //  	var newUser = new User({
	// 	name: req.body.username,
	// 		password: password,
	// });
	// 	//检查用户名是否已经存在
	// User.get(newUser.name, function(err, user) {
	// 		if (user)
	// 			err = 'Username already exists.';
	// 			if (err) {
	// 				req.flash('error', err);
	// 				return res.redirect('/reg');
	// 			}
	// 			//如果不存在则新增用户
	// 			newUser.save(function(err) {
	// 			if (err) {
	// 				req.flash('error', err);
	// 				return res.redirect('/reg');
	// 			}
	// 			req.session.user = newUser;
	// 			req.flash('success', '注册成功');
	// 			res.redirect('/');
	// 		});
	// 	});
	// });
	res.send(queryObj.srcUrl + '(\'{"message": "test"}\')');   
};