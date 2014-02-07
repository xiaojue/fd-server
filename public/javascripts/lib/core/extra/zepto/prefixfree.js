/**
 * @fileoverview zepto插件 - 提供免前缀设置CSS3功能 
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('lib/core/extra/zepto/prefixfree',function(require,exports,module){

	var $ = require('lib/core/zepto/zepto');
	require('lib/core/extra/zepto/zepto');

	var PrefixFree;

	var camelCase = $.camelCase;

	var hyphenate = $.hyphenate;

	/**
	 * PrefixFree 1.0.4
	 * @author Lea Verou
	 * @editor liangdong2@staff.sina.com.cn
	 * MIT license
	 */
	(function(root, undefined){

		if(!window.getComputedStyle) {
			return;
		}

		var getComputedStyle = window.getComputedStyle;

		var self = {
			prefixProperty: function(property, bCamelCase) {
				var prefixed = self.prefix + property;
				return bCamelCase ? camelCase(prefixed) : prefixed;
			}
		};

		PrefixFree = self;

		/**************************************
		 * Properties
		 **************************************/
		(function() {
			var i, property,
				prefixes = {},
				highest = { prefix: '', uses: 0},
				properties = [],
				shorthands = {},
				style = getComputedStyle(document.documentElement, null),
				dummy = document.createElement('div').style;

			// Why are we doing this instead of iterating over properties in a .style object? Cause Webkit won't iterate over those.
			var iterate = function(property) {
				pushUnique(properties, property);

				if(property.indexOf('-') > -1) {
					var parts = property.split('-');

					if(property.charAt(0) === '-') {
						var prefix = parts[1],
							uses = ++prefixes[prefix] || 1;

						prefixes[prefix] = uses;

						if(highest.uses < uses) {
							highest = {prefix: prefix, uses: uses};
						}

						// This helps determining shorthands
						while(parts.length > 3) {
							parts.pop();

							var shorthand = parts.join('-'),
								shorthandDOM = camelCase(shorthand);

							if(shorthandDOM in dummy) {
								pushUnique(properties, shorthand);
							}
						}
					}
				}
			};

			// Some browsers have numerical indices for the properties, some don't
			if(style.length > 0) {
				for(i = 0; i < style.length; i++) {
					iterate(style[i]);
				}
			}
			else {
				for(property in style) {
					iterate(hyphenate(property));
				}
			}

			self.prefix = '-' + highest.prefix + '-';
			self.Prefix = camelCase(self.prefix);

			properties.sort();

			self.properties = [];

			// Get properties ONLY supported with a prefix
			for(i=0; i<properties.length; i++){
				property = properties[i];

				if(property.charAt(0) !== '-') {
					break; // it's sorted, so once we get to the first unprefixed property, we're done
				}

				if(property.indexOf(self.prefix) === 0) { // we might have multiple prefixes, like Opera
					var unprefixed = property.slice(self.prefix.length);

					if(!(camelCase(unprefixed) in dummy)) {
						self.properties.push(unprefixed);
					}
				}
			}

			// IE fix
			if(self.Prefix == 'Ms' &&
				!('transform' in dummy) &&
				!('MsTransform' in dummy) &&
				('msTransform' in dummy)
			){
				self.properties.push('transform', 'transform-origin');
			}

			self.properties.sort();
		})();

		// Add class for current prefix
		root.className += ' ' + self.prefix;

		/**************************************
		 * Utilities
		 **************************************/

		function pushUnique(arr, val) {
			if(arr.indexOf(val) === -1) {
				arr.push(val);
			}
		}

	})(document.documentElement);

	(function(){

		if(!PrefixFree){return;}

		var self = PrefixFree;

		$.cssProps = $.cssProps || {};

		var i, property, camelCased, prefix;
		for(i = 0; i < self.properties.length; i++) {
			property = self.properties[i];
			camelCased = camelCase(property);
			prefix = self.prefixProperty(property);
			$.cssProps[camelCased] = prefix;
		}

		var _css = $.fn.css;

		var formatValue = function(value){
			if(!value){return value;}
			value = value.replace(/transform/gi, $.cssProps['transform']);
			return value;
		};

		$.fn.css = function(property, value){
			var key, prefixKey, camelCased;
			if(typeof property === 'string'){
				camelCased = camelCase(property);
				if($.cssProps[camelCased]){
					property = $.cssProps[camelCased];
					value = formatValue(value);
				}
			}else{
				for(key in property){
					camelCased = camelCase(key);
					if($.cssProps[camelCased]){
						prefixKey = $.cssProps[camelCased];
						property[prefixKey] = formatValue(property[key]);
						delete property[key];
					}
				}
			}

			if(arguments.length < 2){
				return _css.apply(this, [property]);
			}else{
				return _css.apply(this, [property, value]);
			}
		};

		$.getPrefix = function(){
			return PrefixFree.prefix;
		};

	})();


});

