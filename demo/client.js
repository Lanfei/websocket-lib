var ws = require('../lib/websocket');

var client = ws.connect('ws://localhost:8000', function (session) {
	session.setEncoding('utf8');
	session.send('Client');
	session.on('data', function (data) {
		console.log('server:', data);
	});
	session.on('close', function () {
		console.log('close');
	});
});
client.on('error', function (error) {
	console.error(error.stack);
});
