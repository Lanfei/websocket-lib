#!/usr/bin/env node

var ws = require('../lib/websocket');

var server = ws.createServer(function (session) {
	console.log('client connected');
	session.on('data', function (data) {
		console.log('client msg:', data);
		this.send('Hi, ' + data);
	});
	session.on('end', function (code, reason) {
		console.log('client ended:', code, reason);
	});
	session.on('close', function () {
		console.log('session closed');
	});
});

server.on('listening', function () {
	console.log('server listening');
});

server.on('close', function () {
	console.log('server closed');
});

server.on('error', function (error) {
	console.error(error.stack);
});

server.listen(8000);
