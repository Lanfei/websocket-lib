/*!
 * Session Module
 * @author Lanfei
 * @module session
 */
var util = require('util');
var crypto = require('crypto');
var stream = require('stream');
var Frame = require('./frame');

const STATE_CONNECTING = 0;
const STATE_OPEN = 1;
const STATE_CLOSING = 2;
const STATE_CLOSED = 3;

const CLOSE_REASON_NORMAL = 1000;
const CLOSE_REASON_GOING_AWAY = 1001;
const CLOSE_REASON_PROTOCOL_ERROR = 1002;
const CLOSE_REASON_UNSUPPORTED_DATA = 1003;
const CLOSE_REASON_RESERVED = 1004;
const CLOSE_REASON_NO_STATUS = 1005;
const CLOSE_REASON_ABNORMAL = 1006;
const CLOSE_REASON_INVALID_DATA = 1007;
const CLOSE_REASON_POLICY_VIOLATION = 1008;
const CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
const CLOSE_REASON_EXTENSION_REQUIRED = 1010;
const CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
const CLOSE_REASON_SERVICE_RESTART = 1012;
const CLOSE_REASON_TRY_AGAIN_LATER = 1013;
const CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015;

/**
 * WebSocket Session
 * @constructor
 * @extends stream.Duplex
 * @param   {http.IncomingMessage} request see {@link Session#request}
 * @param   {net.Socket}           socket  see {@link Session#socket}
 * @param   {Buffer}               [head]  Data that received with headers.
 */
function Session(request, socket, head) {
	stream.Duplex.call(this, {
		decodeStrings: false,
		readableObjectMode: true
	});
	var self = this;

	this.state = STATE_OPEN;

	/**
	 * An instance of http.IncomingMessage
	 * @type {http.IncomingMessage}
	 * @see  {@link https://nodejs.org/api/http.html#http_class_http_incomingmessage}
	 */
	this.request = request;

	/**
	 * The net.Socket object associated with the connection.
	 * @type {net.Socket}
	 */
	this.socket = socket;

	/**
	 * An alias of {@link Session#socket}
	 * @type {net.Socket}
	 */
	this.connection = socket;

	this.closeCode = null;

	this.closeReason = '';

	this.closeTimeout = 30000;

	this._closeTimer = null;

	this._decoder = null;

	if (head && head.length) {
		socket.unshift(head);
	}

	this.on('ping', function () {
		this.sendPong();
	});
	this.on('end', function (code, reason) {
		clearTimeout(this._closeTimer);
		if (Session.isValidCloseCode(code)) {
			this.closeCode = code;
		} else if (!code) {
			this.closeCode = CLOSE_REASON_NO_STATUS;
		} else {
			this.closeCode = CLOSE_REASON_PROTOCOL_ERROR;
		}
		this.closeReason = reason;
		this.end();
	});
	socket.on('end', function () {
		socket.end();
	});
	socket.on('close', function () {
		/**
		 * Emitted once the socket is fully closed.
		 * @event Session#close
		 */
		self.state = STATE_CLOSED;
		self.closeCode = self.closeCode || Session.CLOSE_REASON_ABNORMAL;
		self.emit('close');
	});
	socket.on('timeout', function () {
		/**
		 * Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle.
		 * The user must manually close the connection.
		 * @event Session#timeout
		 */
		self.emit('timeout');
	});
	socket.on('drain', function () {
		/**
		 * Emitted when the write buffer becomes empty.
		 * @event Session#drain
		 */
		self.emit('drain');
	});
	socket.on('error', function (error) {
		/**
		 * Emitted when an error occurs. The 'close' event will be called directly following this event.
		 * @event Session#error
		 * @param {Error} error The error object.
		 */
		self.emit('error', error);
	});
}

util.inherits(Session, stream.Duplex);

Session.getAcceptKey = function (key) {
	var shasum = crypto.createHash('sha1');
	return shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
};

Session.isValidCloseCode = function (code) {
	return (code >= 1000 && code <= 1003) || code === 1005 || (code >= 1007 && code <= 1011) || (code >= 3000 && code <= 4999);
};

Session.prototype._initReceiver = function () {
	var self = this;
	var length = 0;
	var buffers = [];
	var binary = false;
	var receiver = new Frame.Receiver();
	receiver.on('data', function (frame) {
		/**
		 * Emitted when a WebSocket frame is received.
		 * @event Session#frame
		 * @param {Frame} frame The WebSocket frame.
		 */
		self.emit('frame', frame);
		frame.decode();

		var data = frame.data || new Buffer(0);
		if (frame.opcode === Frame.OPCODE_TEXT) {
			binary = false;
		} else if (frame.opcode === Frame.OPCODE_BINARY) {
			binary = true;
		} else if (frame.opcode === Frame.OPCODE_CLOSE) {
			/**
			 * Emitted when the other end of the socket sends a FIN packet.
			 * @event Session#end
			 * @param {Number} code   The close code.
			 * @param {String} Reason The close Reason.
			 */
			var code = data.length >= 2 ? data.readUInt16BE(0) : CLOSE_REASON_NO_STATUS;
			var reason = data.slice(2).toString();
			self.emit('end', code, reason);
			return;
		} else if (frame.opcode === Frame.OPCODE_PING) {
			/**
			 * Emitted when a Ping frame is received.
			 * @event Session#ping
			 */
			self.emit('ping');
			return;
		} else if (frame.opcode === Frame.OPCODE_PONG) {
			/**
			 * Emitted when a Pong frame is received.
			 * @event Session#pong
			 */
			self.emit('pong');
			return;
		}

		if (!frame.fin || frame.opcode === Frame.OPCODE_CONTINUATION) {
			buffers.push(data);
			length += data.length;
		}

		if (frame.fin) {
			if (buffers.length) {
				data = Buffer.concat(buffers, length);
				buffers = [];
				length = 0;
			}
			/**
			 * Emitted when data is received.
			 * @event Session#data
			 * @param {String|Buffer} data The received data.
			 */
			if (binary) {
				self.push(data);
			} else if (self._decoder) {
				self.push(self._decoder.write(data));
			} else {
				self.push(data.toString());
			}
		}
	});
	this.socket.pipe(receiver);
};

/**
 * Sets the session to timeout after timeout milliseconds of inactivity on the session.
 * By default Session do not have a timeout.
 * @param  {Number}   timeout  If timeout is 0, then the existing idle timeout is disabled.
 * @param  {Function} callback The callback parameter will be added as a one time listener for the 'timeout' event.
 * @return {Session}  this
 * @see    {@link https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback}
 */
Session.prototype.setTimeout = function (timeout, callback) {
	if (callback) {
		this.once('timeout', callback);
	}
	this.socket.setTimeout(timeout);
	return this;
};

/**
 * Disables the Nagle algorithm.
 * @param  {Number}  noDelay
 * @return {Session} this
 * @see    {@link https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay}
 */
Session.prototype.setNoDelay = function (noDelay) {
	this.socket.setNoDelay(noDelay);
	return this;
};

/**
 * Set the encoding for the socket as a Readable Stream.
 * @param  {String} encoding
 * @return {Session} this
 * @see    {@link https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding}
 */
Session.prototype.setEncoding = function (encoding) {
	if (encoding) {
		var StringDecoder = require('string_decoder').StringDecoder;
		this._decoder = new StringDecoder(encoding);
	} else {
		this._decoder = null;
	}
	return this;
};

Session.prototype._read = function () {
};

Session.prototype._write = function (data, encoding, callback) {
	if (encoding) {
		encoding = encoding.toLowerCase();
		encoding = encoding.replace('-', '');
	}
	this.send(data, encoding && encoding !== 'utf8', callback);
};

/**
 * Sends data on the socket.
 * @param  {String|Buffer} data       The data to be sent.
 * @param  {Boolean}       [binary]   If the data is binary.
 * @param  {Function}      [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}                  Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.send = function (data, binary, callback) {
	if (typeof binary === 'function') {
		callback = binary;
		binary = null;
	}
	var frame = new Frame(data, binary);
	return this.sendFrame(frame, callback);
};

/**
 * Sends text data on the socket.
 * @param  {String}   data       The data to be sent.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendText = function (data, callback) {
	var frame = new Frame(data, false);
	return this.sendFrame(frame, callback);
};

/**
 * Sends binary data on the socket.
 * @param  {Buffer}   data       The data to be sent.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendBinary = function (data, callback) {
	var frame = new Frame(data, true);
	return this.sendFrame(frame, callback);
};

/**
 * Sends a ping frame on the socket.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendPing = function (callback) {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PING;
	return this.sendFrame(frame, callback);
};

/**
 * Sends a pong frame on the socket.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendPong = function (callback) {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PONG;
	return this.sendFrame(frame, callback);
};

/**
 * Sends a close frame on the socket.
 * @param  {Number}   [code]     The status code of close reason.
 * @param  {String}   [reason]   The close reason.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendClose = function (code, reason, callback) {
	if (this.state === STATE_OPEN) {
		if (code && !Session.isValidCloseCode(code)) {
			throw new Error('Invalid close code.');
		}

		code = code || this.closeCode || CLOSE_REASON_NORMAL;
		reason = reason || this.closeReason || '';

		var data = new Buffer(2 + Buffer.byteLength(reason));
		data.writeInt16BE(code, 0);
		data.write(reason, 2);

		var frame = new Frame(data);
		frame.opcode = Frame.OPCODE_CLOSE;

		this.state = STATE_CLOSING;
		this._closeTimer = setTimeout(this.destroy.bind(this), this.closeTimeout);

		return this.sendFrame(frame, callback);
	}
};

/**
 * Sends a WebSocket frame on the socket.
 * @param  {Frame}    frame      The sending frame.
 * @param  {Function} [callback] The callback parameter will be executed when the data is finally written out.
 * @return {Boolean}             Returns true if the entire data was flushed successfully to the kernel buffer.
 */
Session.prototype.sendFrame = function (frame, callback) {
	return this.socket.write(frame.toBuffer(), callback);
};

Session.prototype.end = function (data, encoding) {
	if (data !== null && data !== undefined) {
		this.write(data, encoding);
	}
	this.close();
};

/**
 * Half-closes the socket, i.e. it sends a FIN packet. It is possible the server will still send some data.
 * @param {Number} [code]   The status code of close reason.
 * @param {String} [reason] The close reason.
 */
Session.prototype.close = function (code, reason) {
	stream.Duplex.prototype.end.call(this);
	this.sendClose(code, reason);
	if (this.closeCode) {
		this.socket.end();
	}
};

/**
 * Ensures that no more I/O activity happens on this socket.
 * Only necessary in case of errors.
 */
Session.prototype.destroy = function () {
	var superDestroy = stream.Duplex.prototype.destroy;
	if (superDestroy) {
		superDestroy.apply(this, arguments);
	} else {
		this._destroy();
	}
};

Session.prototype._destroy = function (err, cb) {
	stream.Duplex.prototype.end.call(this);
	this.state = Session.STATE_CLOSED;
	this.readable = this.writable = false;
	this.socket.destroy(err, cb);
};

/** @const */
Session.STATE_CONNECTING = Session.prototype.STATE_CONNECTING = STATE_CONNECTING;
/** @const */
Session.STATE_OPEN = Session.prototype.STATE_OPEN = STATE_OPEN;
/** @const */
Session.STATE_CLOSING = Session.prototype.STATE_CLOSING = STATE_CLOSING;
/** @const */
Session.STATE_CLOSED = Session.prototype.STATE_CLOSED = STATE_CLOSED;

/** @const */
Session.CLOSE_REASON_NORMAL = Session.prototype.CLOSE_REASON_NORMAL = CLOSE_REASON_NORMAL;
/** @const */
Session.CLOSE_REASON_GOING_AWAY = Session.prototype.CLOSE_REASON_GOING_AWAY = CLOSE_REASON_GOING_AWAY;
/** @const */
Session.CLOSE_REASON_PROTOCOL_ERROR = Session.prototype.CLOSE_REASON_PROTOCOL_ERROR = CLOSE_REASON_PROTOCOL_ERROR;
/** @const */
Session.CLOSE_REASON_UNSUPPORTED_DATA = Session.prototype.CLOSE_REASON_UNSUPPORTED_DATA = CLOSE_REASON_UNSUPPORTED_DATA;
/** @const */
Session.CLOSE_REASON_RESERVED = Session.prototype.CLOSE_REASON_RESERVED = CLOSE_REASON_RESERVED;
/** @const */
Session.CLOSE_REASON_NO_STATUS = Session.prototype.CLOSE_REASON_NO_STATUS = CLOSE_REASON_NO_STATUS;
/** @const */
Session.CLOSE_REASON_ABNORMAL = Session.prototype.CLOSE_REASON_ABNORMAL = CLOSE_REASON_ABNORMAL;
/** @const */
Session.CLOSE_REASON_INVALID_DATA = Session.prototype.CLOSE_REASON_INVALID_DATA = CLOSE_REASON_INVALID_DATA;
/** @const */
Session.CLOSE_REASON_POLICY_VIOLATION = Session.prototype.CLOSE_REASON_POLICY_VIOLATION = CLOSE_REASON_POLICY_VIOLATION;
/** @const */
Session.CLOSE_REASON_MESSAGE_TOO_BIG = Session.prototype.CLOSE_REASON_MESSAGE_TOO_BIG = CLOSE_REASON_MESSAGE_TOO_BIG;
/** @const */
Session.CLOSE_REASON_EXTENSION_REQUIRED = Session.prototype.CLOSE_REASON_EXTENSION_REQUIRED = CLOSE_REASON_EXTENSION_REQUIRED;
/** @const */
Session.CLOSE_REASON_INTERNAL_SERVER_ERROR = Session.prototype.CLOSE_REASON_INTERNAL_SERVER_ERROR = CLOSE_REASON_INTERNAL_SERVER_ERROR;
/** @const */
Session.CLOSE_REASON_SERVICE_RESTART = Session.prototype.CLOSE_REASON_SERVICE_RESTART = CLOSE_REASON_SERVICE_RESTART;
/** @const */
Session.CLOSE_REASON_TRY_AGAIN_LATER = Session.prototype.CLOSE_REASON_TRY_AGAIN_LATER = CLOSE_REASON_TRY_AGAIN_LATER;
/** @const */
Session.CLOSE_REASON_TLS_HANDSHAKE_FAILED = Session.prototype.CLOSE_REASON_TLS_HANDSHAKE_FAILED = CLOSE_REASON_TLS_HANDSHAKE_FAILED;

module.exports = Session;
Session.Session = Session;
