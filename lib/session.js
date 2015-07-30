/*!
 * Session Module
 * @author Lanfei
 * @module session
 */
var util = require('util');
var crypto = require('crypto');
var Stream = require('stream');
var Frame = require('./frame');

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
const CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015;

/**
 * WebSocket Session
 * @constructor
 * @extends Stream
 * @param   {IncomingMessage} request see {@link Session#request}
 * @param   {Socket}          socket  see {@link Session#socket}
 */
function Session(request, socket) {
	Stream.Duplex.call(this);
	var self = this;

	/**
	 * An instance of http.IncomingMessage
	 * @type {IncomingMessage}
	 * @see  {@link https://nodejs.org/api/http.html#http_http_incomingmessage}
	 */
	this.request = request;

	/**
	 * The net.Socket object associated with the connection.
	 * @type {Socket}
	 */
	this.socket = socket;

	/**
	 * An alias of {@link Session#socket}
	 * @type {Socket}
	 */
	this.connection = socket;

	this._decoder = null;

	this.on('ping', function () {
		this.sendPong();
	});
	this.on('end', function () {
		this.close();
	});
	socket.on('end', function () {
		socket.end();
	});
	socket.on('close', function () {
		/**
		 * @event Session#close
		 */
		self.emit('close');
	});
	socket.on('error', function (error) {
		console.log(error);
		/**
		 * @event Session#error
		 * @type  Error
		 */
		self.emit('error', error);
	});
}

util.inherits(Session, Stream.Duplex);

Session.getWSKey = function (key) {
	var shasum = crypto.createHash('sha1');
	return shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
};

Session.prototype._initReceiver = function () {
	var self = this;
	var length = 0;
	var buffers = [];
	var binary = false;
	var receiver = new Frame.Receiver();
	receiver.on('data', function (frame) {
		/**
		 * @event Session#frame
		 * @type  Frame
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
			 * @event Session#end
			 * @type  Number
			 */
			self.emit('end', data.length > 2 ? data.readUInt16BE(0) : CLOSE_REASON_ABNORMAL);
			return;
		} else if (frame.opcode === Frame.OPCODE_PING) {
			/**
			 * @event Session#ping
			 */
			self.emit('ping');
			return;
		} else if (frame.opcode === Frame.OPCODE_PONG) {
			/**
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
			 * @event Session#data
			 * @type  String|Buffer
			 */
			if (binary) {
				self.emit('data', data);
			} else if (self._decoder) {
				self.emit('data', self._decoder.write(data));
			} else {
				self.emit('data', data.toString());
			}
		}
	});
	this.socket.pipe(receiver);
};

/**
 * Pauses the reading of data.
 * @return {Session} this
 */
Session.prototype.pause = function () {
	this.socket.pause();
	Session.super_.prototype.pause.call(this);
	return this;
};

/**
 * Resumes reading after a call to pause().
 * @return {Session} this
 */
Session.prototype.resume = function () {
	this.socket.resume();
	Session.super_.prototype.resume.call(this);
	return this;
};

/**
 * Disables the Nagle algorithm.
 * @param  {Number} noDelay
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
 * @see {@link https://nodejs.org/api/stream.html#stream_stream_setencoding_encoding}
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
	return null;
};

/**
 * Sends data on the socket.
 * @method Session#write
 * @param {String|Buffer} data       The data to be sent.
 * @param {String}        [encoding] The encoding of the data.
 * @param {Function}      [callback] The callback function.
 */
Session.prototype._write = function (data, encoding, callback) {
	if (encoding) {
		encoding = encoding.toLowerCase();
		encoding = encoding.replace('-', '');
	}
	this.send(data, encoding !== 'utf8', callback);
};

/**
 * Sends data on the socket.
 * @param {String|Buffer} data       The data to be sent.
 * @param {Boolean}       {binary}   If the data is binary.
 * @param {Function}      [callback] The callback function.
 */
Session.prototype.send = function (data, binary, callback) {
	if (typeof binary === 'function') {
		callback = binary;
		binary = false;
	}
	var frame = new Frame(data, binary);
	this.sendFrame(frame, callback);
};

/**
 * Sends text data on the socket.
 * @param {String} data The data to be sent.
 * @param {Function}    [callback] The callback function.
 */
Session.prototype.sendText = function (data, callback) {
	var frame = new Frame(data, false);
	this.sendFrame(frame, callback);
};

/**
 * Sends binary data on the socket.
 * @param {Buffer}   data       The data to be sent.
 * @param {Function} [callback] The callback function.
 */
Session.prototype.sendBinary = function (data, callback) {
	var frame = new Frame(data, true);
	this.sendFrame(frame, callback);
};

/**
 * Sends a ping frame on the socket.
 * @param {Function} [callback] The callback function.
 */
Session.prototype.sendPing = function (callback) {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PING;
	this.sendFrame(frame, callback);
};

/**
 * Sends a pong frame on the socket.
 * @param {Function} [callback] The callback function.
 */
Session.prototype.sendPong = function (callback) {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PONG;
	this.sendFrame(frame, callback);
};

/**
 * Sends a WebSocket frame on the socket.
 * @param {Frame}    frame      The sending frame.
 * @param {Function} [callback] The callback function.
 */
Session.prototype.sendFrame = function (frame, callback) {
	console.log(callback);
	return this.socket.write(frame.toBuffer(), callback);
};

/**
 * Sends a close frame on the socket.
 * @param {Number} [reason] The status code of close reason.
 */
Session.prototype.close = function (reason) {
	if (this.writable) {
		var code = new Buffer(2);
		code.writeInt16BE(reason || CLOSE_REASON_NO_STATUS, 0);

		var frame = new Frame(code);
		frame.opcode = Frame.OPCODE_CLOSE;

		this.sendFrame(frame);
		this.writable = false;
	}
	this.socket.end();
};

/**
 * Half-closes the socket.
 * @param {String|Buffer} data       The data to be sent.
 * @param {String}        {encoding} The encoding of the data.
 */
Session.prototype.end = function (data, encoding) {
	if (data !== undefined) {
		this.write(data, encoding);
	}
	this.close();
	Session.super_.prototype.end.apply(this, arguments);
};

/**
 * Ensures that no more I/O activity happens on this socket.
 * Only necessary in case of errors.
 */
Session.prototype.destroy = function () {
	this.socket.destroy();
};

/** @const */
Session.CLOSE_REASON_NORMAL = CLOSE_REASON_NORMAL;
/** @const */
Session.CLOSE_REASON_GOING_AWAY = CLOSE_REASON_GOING_AWAY;
/** @const */
Session.CLOSE_REASON_PROTOCOL_ERROR = CLOSE_REASON_PROTOCOL_ERROR;
/** @const */
Session.CLOSE_REASON_UNSUPPORTED_DATA = CLOSE_REASON_UNSUPPORTED_DATA;
/** @const */
Session.CLOSE_REASON_RESERVED = CLOSE_REASON_RESERVED;
/** @const */
Session.CLOSE_REASON_NO_STATUS = CLOSE_REASON_NO_STATUS;
/** @const */
Session.CLOSE_REASON_ABNORMAL = CLOSE_REASON_ABNORMAL;
/** @const */
Session.CLOSE_REASON_INVALID_DATA = CLOSE_REASON_INVALID_DATA;
/** @const */
Session.CLOSE_REASON_POLICY_VIOLATION = CLOSE_REASON_POLICY_VIOLATION;
/** @const */
Session.CLOSE_REASON_MESSAGE_TOO_BIG = CLOSE_REASON_MESSAGE_TOO_BIG;
/** @const */
Session.CLOSE_REASON_EXTENSION_REQUIRED = CLOSE_REASON_EXTENSION_REQUIRED;
/** @const */
Session.CLOSE_REASON_INTERNAL_SERVER_ERROR = CLOSE_REASON_INTERNAL_SERVER_ERROR;
/** @const */
Session.CLOSE_REASON_TLS_HANDSHAKE_FAILED = CLOSE_REASON_TLS_HANDSHAKE_FAILED;

module.exports = Session;
Session.Session = Session;