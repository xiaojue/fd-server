
/*
 * GET users listing.
 */

exports.list = function(req, res){
	var url = require('url');
	var util = require('util');

	console.log(reg);
  	// var newUser = new User({
  	// 	name : 
  	// })



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

};