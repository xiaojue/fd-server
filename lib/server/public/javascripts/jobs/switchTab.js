/**
 * @fileoverview 配置页面 tab标签切换
 * @create 2014-03-28
 * @author xiaoyue3
 */
define('jobs/switchTab',function(require,exports,module){
	var $ = require('$');
    //此tab切换 有待优化 
    var exports = {
        nodes:{
            st : $('#switch-tab a'),
            cw : $('#con-wrapper .container')
        },
        init:function(){
            var hash = window.location.hash.replace(/#/g,'');
            var tabMenus = exports.nodes.st;
            var tabContents = exports.nodes.cw;
            switch(hash){
                case '':
                    exports.currentStatus(tabMenus[0],tabContents[0]);
                    break;
                case 'host':
                    exports.currentStatus(tabMenus[0],tabContents[0]);
                    break;
                case 'proxy':
                    exports.currentStatus(tabMenus[1],tabContents[1]);
                    break;
                case 'hostgroup':
                    exports.currentStatus(tabMenus[2],tabContents[2]);
                    break;
            }
            this.switchTab(hash);
        },
        switchTab : function(hash){
            exports.nodes.st.each(function(i){
                exports.nodes.st[i].onclick = function() {
                    exports.nodes.cw.hide();
                    exports.nodes.st.removeClass('current');
                    exports.nodes.cw[i].style.display = '';
                    exports.nodes.st[i].className = 'current';
                }
            })
        },
        currentStatus : function(tab,con) {
            tab.className='current';
            con.style.display='';
        }
    }
    exports.init();
});
