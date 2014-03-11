/**
 * @fileoverview 用户状态管理
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/common/user',function(require,exports,module){

	var $ = require('lib');
	var $cookie = require('lib/kit/util/cookie');
	var $querystring = require('lib/more/querystring');
	var $channel = require('lib/common/channel');
	var $loading = require('mods/dialog/loading');
	var $ssoReady = require('mods/util/ssoReady');

	var User = {};

	//获取登录用户信息
	// @ returns {Object} 用户信息JSON对象，或者null
	User.getUserInfo = function(){
		var userinfo = $cookie.get('mblog_userinfo');
		if(!userinfo) {
			return null;
		}

		userinfo = decodeURIComponent(userinfo);
		return $querystring.parse(userinfo);
	};

	//判断是否登录
	// @ returns {Boolean} 登录与否
	User.isLogin = function(){
		return !!User.getUserInfo();
	};

	//注销
	User.logout = function(callback){
		window.location = 'http://passport.sina.cn/sso/logout?r='+ window.encodeURIComponent(location.href) +'&vt=4';
	};

	//用定时器避免过于密集的状态检查请求
	var checkLSTimer = null;

	//用于缓存登录状态
	var stateLogin = null;

	//检查用户登录状态，判断是否发生变更
	//如果发生变更，发出用户状态变更的广播
	User.checkLoginState = function(){
		var state;
		var loginInfo;

		if(!checkLSTimer){
			loginInfo = User.getUserInfo();
			if(loginInfo){
				state = loginInfo.uid;
			}else{
				state = false;
			}

			if(stateLogin === null){
				//如果尚未记录登录状态，则先记录当前登录状态
				stateLogin = state;
			}else if(stateLogin !== state){
				//否则用当前登录状态与之前的状态做比较
				//如果登录状态发生了变更，则清除缓存，然后更新登录状态
				//考虑到 用户1登录 -> 用户1注销 -> 用户2登录 的状态切换方式
				//状态数据应该为登录用户的uid，而不能是简单的登录与否
				stateLogin = state;
				$channel.fire('loginStateChange');
			}
		}

		//设置定时器，避免密集的状态检查请求造成无谓的CPU消耗
		checkLSTimer = setTimeout(function(){
			checkLSTimer = null;
		});
	};

	$channel.add('login', User.checkLoginState);
	$channel.add('logout', User.checkLoginState);

	User.checkLoginState();

	module.exports = User;

});


