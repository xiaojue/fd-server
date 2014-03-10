/*
 * GET home page.
 */
exports.index = function(req, res){
	var logger = require('../lib/log/logger.js').getLogger("uipage");
	var fs = require("fs");
	var path = require("path");
	var localJson, json;
	var exists = fs.existsSync || path.existsSync;

	var vhosts = {
	    localConfig: path.resolve(__dirname, '../', 'localConfig.json'),
	    config:path.resolve(__dirname, '../', 'config.json')
	};

	var content = {
		config:{"vhost":{},"proxy":[],"port":8989},
		localConfig:{"vhost":{},"proxy":{},"name":[]}
	}
	
	if(!fs.existsSync(vhosts.config)){
		fs.writeFileSync(vhosts.config,JSON.stringify(content.config));
	    logger.info("auto product config.json success.....");
	}

	if(!fs.existsSync(vhosts.localConfig)){
		fs.writeFileSync(vhosts.localConfig,JSON.stringify(content.localConfig));
	   	logger.info("auto product localConfig.json success.....");
	}

	fs.readFile(vhosts.localConfig,'utf-8', function (err, data) {
		if(err){
			logger.error(err);
		}else{
			if(data){
				logger.info(data);
				localJson = JSON.parse(data);
				fs.readFile(vhosts.config,'utf-8', function (err, data1) {
					if(err){
						logger.error(err);
					}else{
						logger.info(data1);
						if(data1){
							json = JSON.parse(data1);
							res.render('index', { title: 'fd-server admin', data: localJson, datac: json});
						}else{
							json = {};
							res.render('index', { title: 'fd-server admin', data: localJson, datac: ''});
						}
					}
				});
			}else{
				logger.info(data);
				localJson = {};
				res.render('index', { title: 'fd-server admin', data: '', datac: ''});
			}
		}
	});
};
