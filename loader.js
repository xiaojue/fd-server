/**
 * @author xiaojue[designsor@gmail.com]
 * @date 20150317
 * @fileoverview loader plugins 加载插件服务，插件包含几个部分，server服务，view视图，control控制，资源样式
 */

var loader = function(){

};

/**
 * plugins 实体
 */

var plugin = {
  name:'vhosts',
  views:'views/',
  routers:{
    index:{
      type:'get',
      js:[],
      css:[],
      controller:'index.js'
    },
    set:{
      type:'post',
      controller:'set.js'
    }
  },
  //server部分有有start和stop两个方法组成，并把实体返回
  server:{
    main:'server.js',
    config:'config.js',
    middleviews:['sass.js','node.js']
  }
};
