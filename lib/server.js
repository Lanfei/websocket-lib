/*!
 * Server Module
 * @author Lanfei
 * @module websocket-lib
 */
var url = require('url');
var util = require('util');
var http = require('http');
var events = require('events');
var Session = require('./session');

/**
 * WebSocket Server
 * @constructor
 * @extends events.EventEmitter
 * @param   {Object}      [options]
 * @param   {String}      [options.path]              see {@link Server#path}
 * @param   {http.Server} [options.httpServer]        see {@link Server#httpServer}
 * @param   {Boolean}     [options.autoAccept = true] see {@link Server#autoAccept}
 * @param   {function}    [sessionListener]           A listener for the 'session' event.
 */
function Server(options, sessionListener) {
	events.EventEmitter.call(this);

	if (typeof options === 'function') {
		sessionListener = options;
		options = {};
	} else if (!options) {
		options = {};
	}

	var self = this;
	var path = options['path'];
	var httpServer = options['httpServer'];
	var server = httpServer || http.createServer();
	var autoAccept = options['autoAccept'];
	if (autoAccept === undefined) {
		autoAccept = true;
	} else {
		autoAccept = !!autoAccept;
	}

	/**
	 * Accept only connections matching this path.
	 * @type {String}
	 */
	this.path = path;

	/**
	 * The Node http or https server instance to attach to.
	 * @type    {http.Server}
	 * @default http.createServer();
	 */
	this.httpServer = server;
	/**
	 * If true, the server will accept sessions automatically, otherwise, you should resolve sessions
	 * by calling {@link Session#accept} or {@link Session#reject} method in {@link Server#session} event.
	 * @type    {Boolean}
	 * @default true
	 */
	this.autoAccept = autoAccept;

	server.on('connection', function (socket) {
		/**
		 * Emitted when a new TCP stream is established.
		 * @event Server#connection
		 * @param {Socket} socket A net.Socket instance.
		 */
		self.emit('connection', socket);
	});
	server.on('upgrade', function (req, socket, head) {
		var ServerSession = self.constructor.Session || Server.Session;
		var session = new ServerSession(req, socket, head, self);
		var upgrade = req.headers['upgrade'];
		var key = req.headers['sec-websocket-key'];
		var reqPath = url.parse(req['url'])['path'];

		if (path && path !== reqPath) {
			if (!httpServer) {
				session.reject(404);
			}
			return;
		}
		if (!key || !upgrade || upgrade.toLowerCase() !== 'websocket') {
			session.reject(400);
			return;
		}
		if (self.autoAccept) {
			session.accept();
		}

		session.on('error', function (e) {
			/**
			 * If a client session emits an 'error' event, it will be forwarded here.
			 * @event Server#clientError
			 * @param {Error}   error   The Error object.
			 * @param {Session} session The Session instance.
			 */
			self.emit('clientError', e, this);
		});

		/**
		 * Emitted when a new session is established.
		 * @event Server#session
		 * @param {Session} session A session instance.
		 */
		self.emit('session', session);
	});
	server.on('listening', function () {
		/**
		 * @event Server#listening
		 */
		self.emit('listening');
	});
	server.on('close', function () {
		/**
		 * Emitted when the server closes.
		 * @event Server#close
		 */
		self.emit('close');
	});
	server.on('timeout', function (socket) {
		/**
		 * @event Server#timeout
		 * @param {Socket} socket The socket instance.
		 */
		self.emit('timeout', socket);
	});
	server.on('error', function (error) {
		/**
		 * Emitted when an error occurs.
		 * @event Server#error
		 * @param {Error} error The error object.
		 */
		self.emit('error', error);
	});
	if (!httpServer) {
		server.on('request', function (req, res) {
			res.writeHead(426);
			res.end();
		});
	}
	if (sessionListener) {
		this.on('session', sessionListener);
	}
}

util.inherits(Server, events.EventEmitter);

/**
 * Returns the bound address
 * @return {Object}
 */
Server.prototype.address = function () {
	return this.httpServer.address();
};

/**
 * Begin accepting sessions.
 * @param {Number}   port       The listening IP.
 * @param {String}   [host]     The listening host.
 * @param {Number}   [backlog]  maximum length of the queue of pending sessions.
 * @param {Function} [callback] A listener for the 'listening' event.
 * @see   {@link https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback}
 */
Server.prototype.listen = function (port, host, backlog, callback) {
	var args = Array.prototype.slice.apply(arguments);
	if (typeof args[args.length - 1] === 'function') {
		callback = args.pop();
		this.on('listening', callback);
	}
	this.httpServer.listen.apply(this.httpServer, args);
	return this;
};

/**
 * Stops the server from accepting new sessions and keeps existing sessions.
 * This function is asynchronous, the server is finally closed when all sessions
 * are ended and the server emits a 'close' event.
 * @param {Function} [callback] A Listener for the 'close' event.
 */
Server.prototype.close = function (callback) {
	if (callback) {
		this.on('close', callback);
	}
	this.httpServer.close();
	return this;
};

/**
 * Sets the timeout value for sockets.
 * @param {Number}   msecs      milliseconds
 * @param {Function} [callback] A Listener for the 'timeout' event.
 */
Server.prototype.setTimeout = function (msecs, callback) {
	if (callback) {
		this.on('timeout', callback);
	}
	this.httpServer.setTimeout(msecs);
	return this;
};

/**
 * The number of milliseconds of inactivity before a socket is presumed to have timed out.
 * @member Server#timeout
 * @type   number
 * @see    {@link https://nodejs.org/api/http.html#http_server_timeout}
 */
Object.defineProperty(Server.prototype, 'timeout', {
	get: function () {
		return this.httpServer.timeout;
	},
	set: function (timeout) {
		this.httpServer.timeout = timeout;
	}
});

/**
 * WebSocket Server Session
 * @constructor
 * @extends  Session
 * @param    {IncomingMessage} request  see {@link Session#request}
 * @param    {Socket}          socket   see {@link Session#socket}
 * @param    {Buffer}          [head]   Data that received with headers.
 * @param    {Server}          [server] see {@link ServerSession#server}
 */
function ServerSession(request, socket, head, server) {
	Session.call(this, request, socket, head);

	this._resHeaders = {};
	this._headerSent = false;

	/**
	 * The server instance of this session.
	 * @type {Server}
	 */
	this.server = server;

	/**
	 * The HTTP status code of handshake.
	 * @type    {Number}
	 * @default 200
	 */
	this.statusCode = 200;

	/**
	 * The HTTP status message of handshake.
	 * @type {String}
	 */
	this.statusMessage = '';
}

util.inherits(ServerSession, Session);

/**
 * Accept the session request.
 * @param {Object}        [headers]          Headers to be sent.
 */
ServerSession.prototype.accept = function (headers) {
	if (this._headerSent) {
		return;
	}
	var reqHeaders = this.request.headers;
	var resHeaders = this._resHeaders;
	var key = reqHeaders['sec-websocket-key'];
	var subProtocols = reqHeaders['sec-websocket-protocol'];
	var acceptKey = Session.getAcceptKey(key);

	headers = headers || {};
	headers['Upgrade'] = 'WebSocket';
	headers['Connection'] = 'Upgrade';
	headers['Sec-WebSocket-Accept'] = acceptKey;
	if (subProtocols && !resHeaders['Sec-WebSocket-Protocol']) {
		headers['Sec-WebSocket-Protocol'] = subProtocols.split(/, +/)[0];
	}

	this.writeHead(101, headers);
	this._initReceiver();
	this._flushHeaders();
	this.state = Session.STATE_OPEN;
};

/**
 * Reject the session request.
 * @param {Number}        [statusCode = 403] The HTTP status code of handshake.
 * @param {Object}        [headers]          Headers to be sent.
 * @param {String|Buffer} [body]             Response body.
 * @param {String}        [encoding]         The encoding of response body.
 */
ServerSession.prototype.reject = function (statusCode, headers, body, encoding) {
	if (this._headerSent) {
		return;
	}
	this.writeHead(statusCode || 403, headers);
	this.setHeader('Connection', 'close');
	this._flushHeaders();
	this.socket.end(body, encoding);
	this.state = Session.STATE_CLOSED;
};

/**
 * Sets a single header value for implicit headers.
 * @param {String}       name
 * @param {String|Array} value
 */
ServerSession.prototype.setHeader = function (name, value) {
	if (this._headerSent) {
		throw new Error('Can\'t set headers after they are sent.');
	}
	this._resHeaders[name] = value;
};

/**
 * Sends a response header to the request.
 * @param {Number} statusCode
 * @param {String} [statusMessage]
 * @param {Object} [headers]
 */
ServerSession.prototype.writeHead = function (statusCode, statusMessage, headers) {
	if (Object.prototype.toString.call(statusMessage) === '[object Object]') {
		headers = statusMessage;
		statusMessage = null;
	}

	this.statusCode = parseInt(statusCode, 10) || this.statusCode;
	this.statusMessage = statusMessage || http.STATUS_CODES[statusCode];

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
			var key = keys[i],
				value = resHeaders[key];
			if (Array.isArray(value)) {
				for (var j = 0; j < value.length; ++j) {
					headers.push(key + ': ' + value[i]);
				}
			} else {
				headers.push(key + ': ' + value);
			}
		}
		this.socket.write(headers.concat('', '').join('\r\n'));
		this._headerSent = true;
	}
};

ServerSession.prototype.sendFrame = function (frame, callback) {
	this._flushHeaders();
	return Session.prototype.sendFrame.call(this, frame, callback);
};

module.exports = Server;
Server.Server = Server;
Server.Session = ServerSession;
