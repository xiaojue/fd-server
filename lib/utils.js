function mixOptions(defaults, options) {
	var mixData = {};
	for (var key in defaults) {
		if (options[key]) mixData[key] = options[key];
		else mixData[key] = defaults[key];
	}
	return mixData;
}

exports.mixOptions = mixOptions;
