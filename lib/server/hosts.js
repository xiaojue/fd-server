/**
*@description hosts管理 绑定和移除hosts
*
* 问题：hostile包hosts文件路径win系统需要修改下，添加c:即可，linux没试过。
*@updateTime 2014-02-20/28 添加日志管理
*/
var logger = require('../log/logger.js').getLogger("vhosts");
var hostile = require('hostile')
var queue = [];

//set 设置host绑定
function set(domain, ip) {
    queue.push(function (cb){
        hostile.set(ip || '127.0.0.1', domain, function (err) {
            if (err) {
                logger.error(err)
            } else {
                logger.info('set hosts successfully! ' + domain)
            }
            cb();
        });
    });
    deal();
}
//remove 移除绑定的host设置
function remove(domain, ip) {
    queue.push(function (cb){
        hostile.remove(ip || '127.0.0.1', domain, function (err) {
            if (err) {
                logger.error(err)
            } else {
                logger.info('remove hosts successfully! ' + domain)
            }
            cb();
        });
    });
    deal();
}

function deal(){
    // logger.info(deal.ing);
    if(deal.ing){
        return;
    }
    deal.ing = true;
    
    var fn = queue.shift();
    if(fn){
        fn(function (){
            deal.ing = false;
            deal();
        });
    }else{
        deal.ing = false;
    }
}

exports.set = set;
exports.remove = remove;
