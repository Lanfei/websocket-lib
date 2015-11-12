#!/usr/bin/env node

var ws = require('../lib/websocket');

var client = ws.connect('ws://localhost:8000', function (session) {
	console.log('connected');
	session.setEncoding('utf8');
	session.send('Client');
	session.on('data', function (data) {
		console.log('server msg:', data);
	});
	session.on('end', function (code) {
		console.log('server ended:', code);
	});
	session.on('close', function () {
		console.log('session closed');
	});
});

client.on('error', function (error) {
	console.error(error.stack);
});
