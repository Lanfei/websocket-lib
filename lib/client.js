var url = require('url');
var util = require('util');
var http = require('http');
var https = require('https');
var events = require('events');
var utils = require('./utils');
var Session = require('./session');

function Client(options, connectListener) {
	events.EventEmitter.call(this);

	if (typeof options === 'string') {
		options = url.parse(options);
	}

	var self = this;
	var ports = {'ws:': 80, 'wss': 443};
	var headers = options.headers || {};
	var protocol = options.protocol || 'ws:';
	var key = new Buffer('ws-' + Date.now()).toString('base64');

	if (protocol !== 'ws:' && protocol !== 'wss:') {
		throw new Error('Protocol "' + protocol + '" not supported.');
	}

	headers['Upgrade'] = 'WebSocket';
	headers['Connection'] = 'Upgrade';
	headers['Sec-WebSocket-Key'] = key;
	headers['Sec-WebSocket-Version'] = 13;

	var req = (protocol === 'ws:' ? http : https).request({
		host: options.host,
		hostname: options.hostname,
		port: options.port || ports[protocol],
		localAddress: options.localAddress,
		socketPath: options.socketPath,
		headers: headers,
		agent: options.agent,
		keepAlive: options.keepAlive,
		keepAliveMsecs: options.keepAliveMsecs
	});

	req.on('upgrade', function (res, socket) {
		var headers = res.headers;
		var upgrade = headers['upgrade'] || '';
		if (upgrade.toLowerCase() !== 'websocket') {
			self.emit('error', new Error('"Upgrade" header value is not "WebSocket".'));
			socket.end();
			return;
		}

		var acceptKey = headers['sec-websocket-accept'];
		var expectedKey = utils.getVerificationKey(key);
		if (acceptKey !== expectedKey) {
			self.emit('error', new Error('Incorrect "Sec-WebSocket-Accept" header value.'));
			socket.end();
			return;
		}

		var connection = headers['connection'];
		if (!/\bUpgrade\b/i.test(connection)) {
			self.emit('error', new Error('"Connection" header value must contain "Upgrade".'));
			socket.end();
			return;
		}

		var session = new ClientSession(headers, socket);
		self.emit('connect', session);
	});
	req.on('error', function (error) {
		self.emit('error', error);
	});
	req.end();

	if (connectListener) {
		this.on('connect', connectListener);
	}
}

util.inherits(Client, events.EventEmitter);

function ClientSession(headers, socket) {
	Session.call(this, headers, socket);
	this._initReceiver();
}

util.inherits(ClientSession, Session);

ClientSession.prototype.sendFrame = function (frame) {
	this.socket.write(frame.toBuffer(true));
};

module.exports = Client;
Client.Client = Client;
