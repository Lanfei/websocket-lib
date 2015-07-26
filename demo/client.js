var ws = require('../lib/websocket');

var client = ws.connect('ws://localhost:8000', function () {
	console.log(arguments);
});
