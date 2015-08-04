# Node WebSocket Library

This is a lightweight WebSocket library for Node.

[![NPM](https://nodei.co/npm/websocket-lib.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/websocket-lib/)

## Installation

```bash
$ npm install websocket-lib
```

### Documentation

- [API documentation](http://lanfei.github.io/websocket)
- [The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

## Examples

### Server

```js
var ws = require('websocket-lib');

var server = ws.createServer(function (session) {
	console.log('client connected');

	session.on('data', function (data) {
		console.log('client msg:', data);
		this.send('Hi, ' + data);
	});

	session.on('close', function () {
		console.log('session closed');
	});
});

server.listen(8000);
```

### Client

```js
var ws = require('websocket-lib');

var client = ws.connect('ws://localhost:8000', function (session) {

	session.setEncoding('utf8');
	session.send('Client');

	session.on('data', function (data) {
		console.log('server msg:', data);
	});

	session.on('close', function () {
		console.log('session closed');
	});
});
```

### Browser

```js
var ws = new WebSocket('ws://localhost:8000');
ws.onmessage = function (event) {
	console.log('server msg:', event.data);
};
ws.onclose = function () {
	console.log('session closed');
};
ws.onopen = function () {
	ws.send('Client');
};
```