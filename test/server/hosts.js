/**
*@description hosts管理 绑定和移除hosts
*
* 问题：hostile包hosts文件路径win系统需要修改下，添加c:即可，linux没试过。另外这个包也只能单条的设置修改，并且由于是异步的会出现相互覆盖现象。我看hostile代码实现不复杂，可参考重新实现一个。目前为了尽快做出点进度，加了队列去设置依次hosts，仍然使用hostile。
*@updateTime 2014-02-20/10
*/
var hostile = require('hostile')
var queue = [];
var ing = false;

//set 设置host绑定
function set(domain, ip) {
    queue.push(function (cb){
        hostile.set(ip || '127.0.0.1', domain, function (err) {
            if (err) {
                console.error(err)
            } else {
                console.log('set hosts successfully! ' + domain)
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
                console.error(err)
            } else {
                console.log('remove hosts successfully! ' + domain)
            }
            cb();
        });
    });
    deal();
}

function deal(){
    // console.log(deal.ing);
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
