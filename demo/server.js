#!/usr/bin/env node

var ws = require('../');

var server = ws.createServer(function (session) {
	console.log('Client Connected');
	session.on('data', function (data) {
		console.log('Client Data:', data);
		this.send('Hi, ' + data);
	});
	session.on('end', function (code, reason) {
		console.log('Client Ended:', code, reason);
	});
	session.on('close', function () {
		console.log('Session Closed');
	});
});

server.on('listening', function () {
	console.log('Server Listening');
});

server.on('close', function () {
	console.log('Server Closed');
});

server.on('error', function (error) {
	console.error(error.stack);
});

server.listen(8000);
