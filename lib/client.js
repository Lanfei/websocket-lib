/*!
 * Client Module
 * @author Lanfei
 * @module client
 */
var url = require('url');
var util = require('util');
var events = require('events');
var Session = require('./session');

/**
 * WebSocket Client
 * @constructor
 * @param  {String|Object} [options]                  If options is a string, it is automatically parsed with url.parse().
 * @param  {String}        [options.host = localhost] A domain name or IP address of the server.
 * @param  {Number}        [options.port = 80|443]    Port of remote server.
 * @param  {Object}        [options.headers]          Headers to be sent to the server.
 * @param  {String|Array}  [options.subProtocols]     The list of WebSocket sub-protocols.
 * @param  {Function}      [connectListener]          A listener for the 'connect' event.
 */
function Client(options, connectListener) {
	events.EventEmitter.call(this);

	if (typeof options === 'string') {
		options = url.parse(options);
	}

	var self = this;
	var ports = {'ws:': 80, 'wss': 443};
	var headers = options['headers'] || {};
	var protocol = options['protocol'] || 'ws:';
	var subProtocols = options['subProtocols'];
	var key = new Buffer('ws-' + Date.now()).toString('base64');

	if (protocol !== 'ws:' && protocol !== 'wss:') {
		throw new Error('Protocol "' + protocol + '" not supported.');
	}

	headers['Upgrade'] = 'WebSocket';
	headers['Connection'] = 'Upgrade';
	headers['Sec-WebSocket-Key'] = key;
	headers['Sec-WebSocket-Version'] = 13;

	if (subProtocols) {
		if (Array.isArray(subProtocols)) {
			subProtocols = subProtocols.join(', ');
		}
		headers['Sec-WebSocket-Protocol'] = subProtocols;
	}

	var req = require(protocol === 'ws:' ? 'http' : 'https').request({
		host: options['hostname'] || options['host'] || 'localhost',
		port: options['port'] || ports[protocol],
		method: 'POST',
		path: options['path'],
		auth: options['auth'],
		localAddress: options['localAddress'],
		socketPath: options['socketPath'],
		headers: headers,
		agent: options['agent']
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
		var expectedKey = Session.getWSKey(key);
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

		var session = new Client.Session(res, socket);
		/**
		 * @event Client#connect
		 * @type  Session
		 */
		self.emit('connect', session);
	});
	req.on('response', function (res) {
		if (res.statusCode !== 201) {
			self.emit('error', new Error('Unexpected response code: ' + res.statusCode));
		}
	});
	req.on('error', function (error) {
		/**
		 * @event Client#error
		 * @type  Error
		 */
		self.emit('error', error);
	});
	req.end();

	if (connectListener) {
		this.on('connect', connectListener);
	}
}

util.inherits(Client, events.EventEmitter);

/**
 * WebSocket Client Session
 * @constructor
 * @extends  Session
 * @memberof Client
 * @param    {IncomingMessage} request see {@link Session#request}
 * @param    {Socket}          socket  see {@link Session#socket}
 */
function ClientSession(request, socket) {
	Session.call(this, request, socket);
	this._initReceiver();
}

util.inherits(ClientSession, Session);

ClientSession.prototype.sendFrame = function (frame, callback) {
	return Session.prototype.sendFrame.call(this, frame.encode(), callback);
};

module.exports = Client;
Client.Client = Client;
Client.Session = ClientSession;
