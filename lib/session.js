var util = require('util');
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

function Session(req, socket) {
	Stream.call(this);
	var self = this;

	this.request = req;
	this.headers = req.headers;
	this.socket = socket;
	this.connection = socket;

	this.readable = true;
	this.writable = true;

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
		self.emit('close');
	});
	socket.on('error', function (error) {
		self.emit('error', error);
	});
}

util.inherits(Session, Stream);

Session.prototype._initReceiver = function () {
	var self = this;
	var length = 0;
	var buffers = [];
	var binary = false;
	var receiver = new Frame.Receiver();
	receiver.on('data', function (frame) {
		self.emit('frame', frame);
		frame.decode();

		var data = frame.data;
		if (frame.opcode === Frame.OPCODE_TEXT) {
			binary = false;
		} else if (frame.opcode === Frame.OPCODE_BINARY) {
			binary = true;
		} else if (frame.opcode === Frame.OPCODE_CLOSE) {
			self.emit('end', frame.data.readUInt16BE(0));
			return;
		} else if (frame.opcode === Frame.OPCODE_PING) {
			self.emit('ping');
			return;
		} else if (frame.opcode === Frame.OPCODE_PONG) {
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

Session.prototype.pause = function () {
	this.socket.pause();
	return this;
};

Session.prototype.resume = function () {
	this.socket.resume();
	return this;
};

Session.prototype.setNoDelay = function (noDelay) {
	this.socket.setNoDelay(noDelay);
	return this;
};

Session.prototype.setEncoding = function (encoding) {
	if (encoding) {
		var StringDecoder = require('string_decoder').StringDecoder;
		this._decoder = new StringDecoder(encoding);
	} else {
		this._decoder = null;
	}
	return this;
};

Session.prototype.write = function (data, encoding, callback) {
	var frame = new Frame(data);
	this.sendFrame(frame, encoding, callback);
};

Session.prototype.send = function (data, binary) {
	var frame = new Frame(data, binary);
	this.sendFrame(frame);
};

Session.prototype.sendText = function (data) {
	var frame = new Frame(data, false);
	this.sendFrame(frame);
};

Session.prototype.sendBinary = function (data) {
	var frame = new Frame(data, true);
	this.sendFrame(frame);
};

Session.prototype.sendFrame = function (frame) {
	this.socket.write(frame.toBuffer());
};

Session.prototype.sendPing = function () {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PING;
	this.sendFrame(frame);
};

Session.prototype.sendPong = function () {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_PONG;
	this.sendFrame(frame);
};

Session.prototype.close = function (reason) {
	if (this.socket.writable) {
		var code = new Buffer(2);
		code.writeInt16BE(reason || CLOSE_REASON_NORMAL, 0);

		var frame = new Frame(code);
		frame.opcode = Frame.OPCODE_CLOSE;

		this.sendFrame(frame);
		this.writable = false;
	}
	this.socket.end();
};

Session.prototype.end = function (data, encoding) {
	if (data !== undefined) {
		this.write(data, encoding);
	}
	this.close();
};

Session.prototype.destroy = function () {
	this.socket.destroy();
};

Session.CLOSE_REASON_NORMAL = CLOSE_REASON_NORMAL;
Session.CLOSE_REASON_GOING_AWAY = CLOSE_REASON_GOING_AWAY;
Session.CLOSE_REASON_PROTOCOL_ERROR = CLOSE_REASON_PROTOCOL_ERROR;
Session.CLOSE_REASON_UNSUPPORTED_DATA = CLOSE_REASON_UNSUPPORTED_DATA;
Session.CLOSE_REASON_RESERVED = CLOSE_REASON_RESERVED;
Session.CLOSE_REASON_NO_STATUS = CLOSE_REASON_NO_STATUS;
Session.CLOSE_REASON_ABNORMAL = CLOSE_REASON_ABNORMAL;
Session.CLOSE_REASON_INVALID_DATA = CLOSE_REASON_INVALID_DATA;
Session.CLOSE_REASON_POLICY_VIOLATION = CLOSE_REASON_POLICY_VIOLATION;
Session.CLOSE_REASON_MESSAGE_TOO_BIG = CLOSE_REASON_MESSAGE_TOO_BIG;
Session.CLOSE_REASON_EXTENSION_REQUIRED = CLOSE_REASON_EXTENSION_REQUIRED;
Session.CLOSE_REASON_INTERNAL_SERVER_ERROR = CLOSE_REASON_INTERNAL_SERVER_ERROR;
Session.CLOSE_REASON_TLS_HANDSHAKE_FAILED = CLOSE_REASON_TLS_HANDSHAKE_FAILED;

module.exports = Session;
Session.Session = Session;
