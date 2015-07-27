var ws = require('../lib/websocket');

var server = ws.createServer(function (session) {
	console.log('client: connect');
	session.on('data', function (data) {
		console.log('client:', data);
		this.send('Hi, ' + data);
	});
	session.on('end', function () {
		console.log('client: end');
	});
	session.on('close', function () {
		console.log('client: close');
	});
});

server.on('listening', function () {
	console.log('server: listening');
});

server.on('close', function () {
	console.log('server: close');
});

server.on('error', function (error) {
	console.error(error.stack);
});

server.listen(8000);