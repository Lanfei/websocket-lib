var fs = require('fs');
var ws = require('../lib/websocket');
var frame = require('../lib/frame');

var server = ws.createServer(function(session) {
	console.log('connect');
	session.on('data', function(data) {
		console.log('data: ', data);
		this.send('Hi, Client!');
	});
	session.on('end', function() {
		console.log('end');
	});
	session.on('close', function() {
		console.log('close');
	});
});

server.listen(8000);