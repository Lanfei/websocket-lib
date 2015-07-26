var url = require('url');
var http = require('http');

function Client(options, callback) {
	if (typeof options === 'string') {
		options = url.parse(options);
	}
	http.get({
		port: options.port,
		hostname: options.hostname,
		headers: [
			'Upgrade: websocket',
			'Connection: Upgrade',
			'Sec-WebSocket-Key: ' + 'JO+Uhd3TEkLBWno1qHMXUA=='
		]
	}, callback);
	console.log(options);
}

module.exports = Client;

Client.Client = Client;
