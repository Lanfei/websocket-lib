#!/usr/bin/env node

var ws = require('../');

var client = ws.connect('ws://localhost:8000', function (session) {
	console.log('Connected');
	session.setEncoding('utf8');
	session.send('Client');
	session.on('data', function (data) {
		console.log('Server Data:', data);
	});
	session.on('end', function (code, reason) {
		console.log('Server Ended:', code, reason);
	});
	session.on('close', function () {
		console.log('Session Closed');
	});
});

client.on('error', function (error) {
	console.error(error.stack);
});
