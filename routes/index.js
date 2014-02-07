
/*
 * GET home page.
 */

// module.exports = function(app) {
// 	app.get('/', function(req, res) {
// 		res.render('index', {
// 			title: 'RIA统一开发平台'
// 		});
// 	});
// }

exports.index = function(req, res){
  	res.render('index', { title: 'RIA统一开发平台' });
  	// throw new Error('An error for test purposes.');
};