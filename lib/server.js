var util = require('util');
var http = require('http');
var events = require('events');
var utils = require('./utils');
var Session = require('./session');

function Server(options, connectListener) {
	events.EventEmitter.call(this);

	if (typeof options === 'function') {
		connectListener = options;
		options = {};
	}

	var autoAccept = options.autoAccept;
	if (autoAccept === undefined) {
		autoAccept = true;
	} else {
		autoAccept = !!autoAccept;
	}

	var self = this;
	var server = options.httpServer || http.createServer();
	server.on('upgrade', function (req, socket) {
		var session = new ServerSession(req, socket);
		if (autoAccept) {
			session.accept();
		}
		self.emit('connection', session);
	});
	server.on('listening', function () {
		self.emit('listening');
	});
	server.on('close', function () {
		self.emit('close');
	});
	server.on('error', function (error) {
		self.emit('error', error);
	});
	if (connectListener) {
		this.on('connection', connectListener);
	}
	this.httpServer = server;
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function () {
	this.httpServer.listen.apply(this.httpServer, arguments);
};

Server.prototype.close = function (callback) {
	this.httpServer.close(callback);
};

Server.prototype.address = function () {
	return this.httpServer.address();
};

function ServerSession(req, socket) {
	Session.call(this, req, socket);

	this._resHeaders = {};
	this._headerSent = false;

	this.statusCode = 200;
	this.statusMessage = '';
}

util.inherits(ServerSession, Session);

ServerSession.prototype.accept = function () {
	if (this._headerSent) {
		return;
	}
	var key = this.headers['sec-websocket-key'];
	var acceptKey = utils.getWSKey(key);
	this.writeHead(101, {
		'Upgrade': 'WebSocket',
		'Connection': 'Upgrade',
		'Sec-WebSocket-Accept': acceptKey
	});
	this._initReceiver();
	this._flushHeaders();
};

ServerSession.prototype.reject = function (statusCode, headers) {
	if (this._headerSent) {
		return;
	}
	this.writeHead(statusCode || 403, headers);
	this.setHeader('Connection', 'close');
	this._flushHeaders();
};

ServerSession.prototype.setHeader = function (name, value) {
	if (this._headerSent) {
		throw new Error('Can\'t set headers after they are sent.');
	}
	this._resHeaders[name] = value;
};

ServerSession.prototype.writeHead = function (statusCode, reason, headers) {
	if (reason && !utils.isString(reason)) {
		headers = reason;
		reason = null;
	}

	this.statusCode = parseInt(statusCode, 10) || this.statusCode;
	this.statusMessage = reason || http.STATUS_CODES[statusCode];

	if (headers) {
		var keys = Object.keys(headers);
		var resHeaders = this._resHeaders;
		for (var i = 0, l = keys.length; i < l; ++i) {
			var key = keys[i];
			resHeaders[key] = headers[key];
		}
	}
};

ServerSession.prototype._flushHeaders = function () {
	if (!this._headerSent) {
		var headers = [
			'HTTP/1.1 ' + this.statusCode + ' ' + this.statusMessage
		];
		var resHeaders = this._resHeaders;
		var keys = Object.keys(resHeaders);
		for (var i = 0, l = keys.length; i < l; ++i) {
			var key = keys[i];
			headers.push(key + ': ' + resHeaders[key]);
		}
		this.socket.write(headers.concat('', '').join('\r\n'));
		this._headerSent = true;
	}
};

ServerSession.prototype.sendFrame = function (frame) {
	this._flushHeaders();
	this.socket.write(frame.toBuffer());
};

module.exports = Server;
Server.Server = Server;
Server.Session = ServerSession;
