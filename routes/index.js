
/*
 * GET home page.
 */
exports.index = function(req, res){
  	res.render('index', { title: 'RIA统一开发平台' });
};