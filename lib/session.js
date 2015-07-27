var util = require('util');
var Stream = require('stream');
var Frame = require('./frame');

function Session(headers, socket) {
	Stream.call(this);
	var self = this;

	this.headers = headers;
	this.socket = socket;
	this.connection = socket;

	this.readable = true;
	this.writable = true;

	this._decoder = null;

	this.on('ping', function () {
		this.sendPong();
	});
	this.on('end', function () {
		this.socket.end();
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
		var data;
		if (frame.opcode === Frame.OPCODE_CONTINUATION) {
			data = frame.data;
		} else if (frame.opcode === Frame.OPCODE_TEXT) {
			data = frame.data;
			binary = false;
		} else if (frame.opcode === Frame.OPCODE_BINARY) {
			data = frame.data;
			binary = true;
		} else if (frame.opcode === Frame.OPCODE_CLOSE) {
			self.emit('end');
		} else if (frame.opcode === Frame.OPCODE_PING) {
			self.emit('ping');
		} else if (frame.opcode === Frame.OPCODE_PONG) {
			self.emit('pong');
		}
		if (!data) {
			return;
		}

		buffers.push(frame.data);
		length += frame.data.length;

		if (frame.fin) {
			data = Buffer.concat(buffers, length);
			if (binary) {
				self.emit('data', data);
			} else if (self._decoder) {
				self.emit('data', self._decoder.write(data));
			} else {
				self.emit('data', data.toString());
			}
			buffers = [];
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

Session.prototype.close = function () {
	var frame = new Frame();
	frame.opcode = Frame.OPCODE_CLOSE;
	this.sendFrame(frame);
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

module.exports = Session;
Session.Session = Session;