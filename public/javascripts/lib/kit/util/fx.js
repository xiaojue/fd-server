/**
 * @fileoverview 动画类 - 用于处理不适合使用transition的场景
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 * @from mootools
 */

define('lib/kit/util/fx',function(require,exports,module){

	var $ = require('lib');
	var $class = require('lib/more/class');
	var $events = require('lib/more/events');
	var $erase = require('lib/kit/arr/erase');
	var $contains = require('lib/kit/arr/contains');
	var $timer = require('lib/kit/util/timer');

	// global timers
	// 使用公共定时器可以减少浏览器资源消耗

	var instances = {}, timers = {};

	var loop = function(){
		var now = Date.now();
		for (var i = this.length; i--;){
			var instance = this[i];
			if (instance) instance.step(now);
		}
	};

	var pushInstance = function(fps){
		var list = instances[fps] || (instances[fps] = []);
		list.push(this);
		if (!timers[fps]) timers[fps] = $timer.setInterval(loop.bind(list), Math.round(1000 / fps) );
	};

	var pullInstance = function(fps){
		var list = instances[fps];
		if (list){
			$erase(list, this);
			if (!list.length && timers[fps]){
				delete instances[fps];
				timers[fps] = $timer.clearInterval(timers[fps]);
			}
		}
	};

	var Fx = $class.create({
		Implements : [$events],

		//初始化
		initialize : function(options){
			this.options = $.extend({
				fps: 1000,			//帧速率，实际上动画运行的最高帧速率不会高于 requestAnimationFrame 提供的帧速率
				duration: 500,		//动画时间
				transition : null,	//动画执行方式，仅在加载了 kit/util/transitions 模块后才起作用
				frames: null,		//从哪一帧开始执行
				frameSkip: true,	//是否跳帧
				link: 'ignore'		//动画衔接方式，可选：['ignore', 'cancel']
			}, options);
		},

		setOptions : function(options){
			this.conf = $.extend(true, {}, this.options, options);
		},

		getTransition: function(){
			return function(p){
				return -(Math.cos(Math.PI * p) - 1) / 2;
			};
		},

		step: function(now){
			if (this.options.frameSkip){
				var diff = (this.time != null) ? (now - this.time) : 0, frames = diff / this.frameInterval;
				this.time = now;
				this.frame += frames;
			} else {
				this.frame++;
			}

			if (this.frame < this.frames){
				var delta = this.transition(this.frame / this.frames);
				this.set(this.compute(this.from, this.to, delta));
			} else {
				this.frame = this.frames;
				this.set(this.compute(this.from, this.to, 1));
				this.stop();
			}
		},

		set: function(now){
			return now;
		},

		compute: function(from, to, delta){
			return Fx.compute(from, to, delta);
		},

		check: function(){
			if (!this.isRunning()) return true;
			switch (this.options.link){
				case 'cancel': this.cancel(); return true;
			}
			return false;
		},

		start: function(from, to){
			if (!this.check(from, to)) return this;
			this.from = from;
			this.to = to;
			this.frame = (this.options.frameSkip) ? 0 : -1;
			this.time = null;
			this.transition = this.getTransition();
			var frames = this.options.frames, fps = this.options.fps, duration = this.options.duration;
			this.duration = Fx.Durations[duration] || parseInt(duration, 10) || 0;
			this.frameInterval = 1000 / fps;
			this.frames = frames || Math.round(this.duration / this.frameInterval);
			this.trigger('start');
			pushInstance.call(this, fps);
			return this;
		},

		stop: function(){
			if (this.isRunning()){
				this.time = null;
				pullInstance.call(this, this.options.fps);
				if (this.frames == this.frame){
					this.trigger('complete');
				} else {
					this.trigger('stop');
				}
			}
			return this;
		},

		cancel: function(){
			if (this.isRunning()){
				this.time = null;
				pullInstance.call(this, this.options.fps);
				this.frame = this.frames;
				this.trigger('cancel');
			}
			return this;
		},

		pause: function(){
			if (this.isRunning()){
				this.time = null;
				pullInstance.call(this, this.options.fps);
			}
			return this;
		},

		resume: function(){
			if ((this.frame < this.frames) && !this.isRunning()) pushInstance.call(this, this.options.fps);
			return this;
		},

		isRunning: function(){
			var list = instances[this.options.fps];
			return list && $contains(list, this);
		}
	});

	Fx.compute = function(from, to, delta){
		return (to - from) * delta + from;
	};

	Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};

	module.exports = Fx;

});


