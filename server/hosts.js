/**
* hosts管理 set绑定host，remove移除绑定的host，batchLoad从配置文件中读取并设置hosts
*/
var hostile = require('hostile')
var queue = [];
var ing = false;

//set 设置host绑定
function set(domain, ip) {
    if(ing){
        queue.push(function (){
            set(domain, ip);
        });
    }else{
        ing = true;
        hostile.set(ip || '127.0.0.1', domain, function (err) {
            if (err) {
                console.error(err)
            } else {
                console.log('set hosts successfully! ' + domain)
            }
            
            ing = false;
            var fn = queue.shift();
            if(typeof fn === "function"){
                fn();
            }
        });
    }
}
//remove 移除绑定的host设置
function remove(domain, ip) {
    if(ing){
        queue.push(function (){
            remove(domain, ip);
        });
    }else{
        hostile.remove(ip || '127.0.0.1', domain, function (err) {
            if (err) {
                console.error(err)
            } else {
                console.log('remove hosts successfully!' + domain)
            }
            
            ing = false;
            var fn = queue.shift();
            if(typeof fn === "function"){
                fn();
            }
        });
    }
}

exports.set = set;
exports.remove = remove;
