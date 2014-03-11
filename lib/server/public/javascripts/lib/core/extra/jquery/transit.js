/**
 * @fileoverview 封装使用transition的动画
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/core/extra/jquery/transit', function(require, exports, module) {

	var $ = require('lib/core/jquery/jquery');

	var prefix = '';
	var eventPrefix;
	var endEventName;
	var endAnimationName;
	var vendors = {
		Webkit: 'webkit',
		Moz: '',
		O: 'o',
		ms: 'MS'
	};
	var document = window.document;
	var testEl = document.createElement('div');
	var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;
	var transform;
	var transitionProperty;
	var transitionDuration;
	var transitionTiming;
	var animationName;
	var animationDuration;
	var animationTiming;
	var cssReset = {};

	function dasherize(str) {
		return downcase(str.replace(/([a-z])([A-Z])/, '$1-$2'));
	}

	function downcase(str) {
		return str.toLowerCase();
	}

	function normalizeEvent(name) {
		return eventPrefix ? eventPrefix + name : downcase(name);
	}

	$.each(vendors, function(vendor, event) {
		if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
			prefix = '-' + downcase(vendor) + '-';
			eventPrefix = event;
			return false;
		}
	});

	transform = prefix + 'transform';
	cssReset[transitionProperty = prefix + 'transition-property'] =
		cssReset[transitionDuration = prefix + 'transition-duration'] =
		cssReset[transitionTiming = prefix + 'transition-timing-function'] =
		cssReset[animationName = prefix + 'animation-name'] =
		cssReset[animationDuration = prefix + 'animation-duration'] =
		cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

	$.transition = {
		off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
		speeds: {
			_default: 400,
			fast: 200,
			slow: 600
		},
		cssPrefix: prefix,
		transitionEnd: normalizeEvent('TransitionEnd'),
		animationEnd: normalizeEvent('AnimationEnd')
	};

	$.fn.transit = function(properties, duration, ease, callback) {
		if ($.isPlainObject(duration)){
			ease = duration.easing;
			callback = duration.complete;
			duration = duration.duration;
		}

		if (duration){
			duration = (typeof duration == 'number' ? duration :
				($.transition.speeds[duration] || $.transition.speeds._default)) / 1000;
		}
		return this._transit(properties, duration, ease, callback);
	};

	$.fn._transit = function(properties, duration, ease, callback) {
		var key;
		var cssValues = {};
		var cssProperties;
		var transforms = '';
		var that = this;
		var wrappedCallback;
		var endEvent = $.transition.transitionEnd;

		if (duration === undefined){
			duration = 0.4;
		}

		if ($.transition.off){
			duration = 0;
		}

		if (typeof properties == 'string') {
			// keyframe animation
			cssValues[animationName] = properties;
			cssValues[animationDuration] = duration + 's';
			cssValues[animationTiming] = (ease || 'linear');
			endEvent = $.transition.animationEnd;
		} else {
			cssProperties = [];
			// CSS transitions
			for (key in properties){
				if (supportedTransforms.test(key)){
					transforms += key + '(' + properties[key] + ') ';
				}else{
					cssValues[key] = properties[key];
					cssProperties.push(dasherize(key));
				}
			}

			if (transforms){
				cssValues[transform] = transforms;
				cssProperties.push(transform);
			}

			if (duration > 0 && typeof properties === 'object') {
				cssValues[transitionProperty] = cssProperties.join(', ');
				cssValues[transitionDuration] = duration + 's';
				cssValues[transitionTiming] = (ease || 'linear');
			}
		}

		wrappedCallback = function(event) {
			if (typeof event !== 'undefined') {
				if (event.target !== event.currentTarget){
					// makes sure the event didn't bubble from "below"
					return;
				}
				$(event.target).unbind(endEvent, wrappedCallback);
			}
			$(this).css(cssReset);
			if(callback){
				callback.call(this);
			}
		};

		if (duration > 0){
			this.bind(endEvent, wrappedCallback);
		}

		// trigger page reflow so new elements can transit
		this.size() && this.get(0).clientLeft;
		this.css(cssValues);

		//css样式无变化时，不会触发transit事件
		var hasChange = !(
			Object.keys(properties).every(function(prop){
				var original = that.css(prop) + '';
				var target = properties[prop] + '';
				return original === target;
			})
		);

		if (duration <= 0 || !hasChange){
			this.unbind(endEvent, wrappedCallback);
			setTimeout(function() {
				that.each(function() {
					wrappedCallback.call(this);
				});
			}, 0);
		}

		return this;
	};

	testEl = null;

});

