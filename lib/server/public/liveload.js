(function() {
	var doc = document;
	var header = doc.head || getByTagName('head')[0] || doc.documentElement;

	function getByTagName(tag, ele) {
		ele = ele || doc;
		return ele ? ele.getElementsByTagName(tag) : ele;
	}

	function getscript(url, cb, charset) {
		var node = createNode('script', charset);
		node.onload = node.onerror = node.onreadystatechange = function() {
			if (/loaded|complete|undefined/.test(node.readyState)) {
				node.onload = node.onerror = node.onreadystatechange = null;
				if (node.parentNode) node.parentNode.removeChild(node);
				node = undefined;
				cb();
			}
		};
		node.async = 'async';
		node.src = url;
		insertscript(node);
	}

	function createNode(tag, charset) {
		var node = doc.createElement(tag);
		if (charset) node.charset = charset;
		return node;
	}

	function insertscript(node) {
		var baseElement = getByTagName('base', header)[0];
		baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
	}

	function reload(data) {
		if (data.changed) {
			window.location.reload();
		} else {
			setTimeout(polling, 1000);
		}
	}

	function polling() {
		var cb = 'liveload' + new Date().valueOf();
		window[cb] = reload;
		getscript('http://local.fd.server/watch?callback=' + cb, function() {},
		'utf-8');
	}

	polling();

})();

