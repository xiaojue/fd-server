
/*
 * GET home page.
 */
exports.index = function(req, res){
	var fs = require("fs");
	var localJson, json;

	fs.readFile('localConfig.json','utf-8', function (err, data) {
		if(err){
			console.log(err);
		}else{
			if(data){
				console.log(data);
				localJson = JSON.parse(data);
				fs.readFile('config.json','utf-8', function (err, data1) {
					if(err){
						console.log(err);
					}else{
						if(data1){
							json = JSON.parse(data1);
							res.render('index', { title: 'RIA统一开发平台', data: localJson, datac: json});
						}else{
							json = {};
							res.render('index', { title: 'RIA统一开发平台', data: localJson, datac: ''});
						}
					}
				});
			}else{
				localJson = {};
				res.render('index', { title: 'RIA统一开发平台', data: '', datac: ''});

			}
		}
	});
};
