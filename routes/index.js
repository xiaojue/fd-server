
/*
 * GET home page.
 */
exports.index = function(req, res){
	var fs = require("fs");
	fs.readFile('config.json','utf-8', function (err, data) {
		if(err){
			console.log(err);
		}else{
			if(data){
				var json = JSON.parse(data);
				res.render('index', { title: 'RIA统一开发平台', data: json});
			}else{
				json = {};
				res.render('index', { title: 'RIA统一开发平台', data: ''});
			}
		}
	});
  	
};
