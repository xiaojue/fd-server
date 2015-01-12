/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview 进驻到系统服务中的常驻js脚本
 */
var server = require('./server/index');
var utils = require('./utils');
//var fs = require('fs');
//var path = require('path');
//var configManager = require('./configManager');
server.start(utils.noop);

/*
var pluginsManager = function() {
  this.path = path.resolve(__dirname,'..','plugins');
  this.configManager = configManager;
};

pluginsManager.prototype = {
  constructor: pluginsManager,
  load: function() {

  },
  reload:function(){
         
  },
  start: function() {

  },
  stop: function() {

  },
  startAll: function() {

  },
  stopAll: function() {

  }
};

var plugins = new pluginsManager();

plugins.load([
  'vhost'    
]);

console.log(plugins.path);
*/
