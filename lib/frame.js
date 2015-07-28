var util = require('util');
var Stream = require('stream');

const OPCODE_CONTINUATION = 0;
const OPCODE_TEXT = 1;
const OPCODE_BINARY = 2;
const OPCODE_CLOSE = 8;
const OPCODE_PING = 9;
const OPCODE_PONG = 10;

function Frame(data, binary) {
	if (data instanceof Frame) {
		return data;
	}
	if (arguments.length) {
		this.fin = 1;
		this.rsv1 = 0;
		this.rsv2 = 0;
		this.rsv3 = 0;
		if (binary === true) {
			this.opcode = OPCODE_BINARY;
		} else if (binary === false) {
			this.opcode = OPCODE_TEXT;
		} else if (Buffer.isBuffer(data)) {
			this.opcode = OPCODE_BINARY;
		} else {
			this.opcode = OPCODE_TEXT;
		}
		this.masked = 0;
		this.mask = null;
		if (data) {
			this.data = new Buffer(data);
			this.length = this.data.length;
		} else {
			this.data = null;
			this.length = 0;
		}
	} else {
		this.fin = 1;
		this.rsv1 = 0;
		this.rsv2 = 0;
		this.rsv3 = 0;
		this.opcode = 0;
		this.masked = 0;
		this.length = 0;
		this.mask = null;
		this.data = null;
	}
}

Frame.prototype.encode = function () {
	if (!this.masked) {
		var data = this.data;
		var mask = new Buffer(4);
		var rnd = Math.random() * 0xffffffff | 0;
		mask.writeUInt32BE(rnd, 0, true);
		for (var i = 0, l = this.length; i < l; ++i) {
			data[i] = data[i] ^ mask[i % 4];
		}
		this.mask = mask;
		this.masked = 1;
	}
	return this;
};

Frame.prototype.decode = function () {
	if (this.masked) {
		var data = this.data;
		var mask = this.mask;
		for (var i = 0, l = this.length; i < l; ++i) {
			data[i] = data[i] ^ mask[i % 4];
		}
		this.masked = 0;
	}
	return this;
};

Frame.prototype.toBuffer = function () {
	var buffers = [];

	var length = this.length;
	if (this.length > 125) {
		length = 126;
	} else if (this.length > 0xffff) {
		length = 127;
	}

	var firstByte = this.fin << 7 | this.rsv1 << 6 | this.rsv2 << 5 | this.rsv3 << 4 | this.opcode;
	var secondByte = this.masked << 7 | length;
	var header = new Buffer(2);
	header[0] = firstByte;
	header[1] = secondByte;
	buffers.push(header);

	var extLen;
	if (length === 126) {
		extLen = new Buffer(2);
		extLen.writeUIntBE(this.length, 0, 2, true);
	} else if (length === 127) {
		extLen = new Buffer(8);
		extLen.writeUIntBE(this.length, 0, 8, true);
	}
	if (extLen) {
		buffers.push(extLen);
	}

	var mask = this.mask;
	if (mask) {
		buffers.push(mask);
	}

	var data = this.data;
	if (data) {
		buffers.push(data);
	}
	return Buffer.concat(buffers);
};

const WAITING_FOR_HEADER = 0;
const WAITING_FOR_16_BIT_LENGTH = 1;
const WAITING_FOR_64_BIT_LENGTH = 2;
const WAITING_FOR_MASK_KEY = 3;
const WAITING_FOR_PAYLOAD = 4;
const COMPLETE = 5;

function Receiver() {
	Stream.call(this);

	this.readable = true;
	this.writable = true;

	this._buffer = null;
	this._paused = false;
	this._frame = new Frame();
	this._state = WAITING_FOR_HEADER;
}

util.inherits(Receiver, Stream);

Receiver.prototype.write = function (buffer) {
	if (!buffer || !this.writable) {
		return;
	}
	buffer = new Buffer(buffer);
	if (this._buffer) {
		this._buffer = Buffer.concat([this._buffer, buffer]);
	} else {
		this._buffer = buffer;
	}
	this.parse();
};

Receiver.prototype.parse = function () {
	var frame = this._frame;
	var buffer = this._buffer;
	if (!this._paused && this._state == WAITING_FOR_HEADER) {
		if (buffer.length < 2) {
			return;
		}

		var firstByte = buffer[0];
		var secondByte = buffer[1];

		frame.fin = firstByte >> 7;
		frame.rsv1 = (firstByte & 64) >> 6;
		frame.rsv2 = (firstByte & 32) >> 5;
		frame.rsv3 = (firstByte & 16) >> 4;
		frame.opcode = firstByte & 15;
		frame.masked = secondByte >> 7;
		frame.length = secondByte & 127;

		buffer = buffer.slice(2);

		if (frame.length === 126) {
			this._state = WAITING_FOR_16_BIT_LENGTH;
		} else if (frame.length === 127) {
			this._state = WAITING_FOR_64_BIT_LENGTH;
		} else {
			this._state = WAITING_FOR_MASK_KEY;
		}
	}
	if (!this._paused && this._state === WAITING_FOR_16_BIT_LENGTH) {
		if (buffer.length < 2) {
			return;
		}
		frame.length = buffer.readUIntBE(0, 2);

		buffer = buffer.slice(2);

		this._state = WAITING_FOR_MASK_KEY;
	}
	if (!this._paused && this._state === WAITING_FOR_64_BIT_LENGTH) {
		if (buffer.length < 8) {
			return;
		}
		frame.length = buffer.readUIntBE(0, 8);

		buffer = buffer.slice(8);

		this._state = WAITING_FOR_MASK_KEY;
	}
	if (!this._paused && this._state === WAITING_FOR_MASK_KEY) {
		if (frame.masked && buffer.length < 4) {
			return;
		}
		if (frame.masked) {
			frame.mask = buffer.slice(0, 4);
			buffer = buffer.slice(4);
		}
		this._state = WAITING_FOR_PAYLOAD;
	}
	if (!this._paused && this._state === WAITING_FOR_PAYLOAD) {
		if (buffer.length < frame.length) {
			return;
		}
		var length = frame.length;
		var data = buffer.slice(0, length);
		buffer = buffer.slice(length);
		frame.data = data;
		this._state = COMPLETE;
	}

	this._buffer = buffer;
	if (!this._paused && this._state === COMPLETE) {
		this.emit('data', frame);
		this._frame = new Frame();
		this._state = WAITING_FOR_HEADER;

		if (!this._paused && buffer.length) {
			this.parse();
		}
	}
};

Receiver.prototype.pause = function () {
	this._paused = true;
};

Receiver.prototype.resume = function () {
	this._paused = false;
	process.nextTick(this.parse.bind(this));
};

Receiver.prototype.end = function (buffer) {
	this.write(buffer);
	this.writable = false;
};

module.exports = Frame;

Frame.OPCODE_CONTINUATION = OPCODE_CONTINUATION;
Frame.OPCODE_TEXT = OPCODE_TEXT;
Frame.OPCODE_BINARY = OPCODE_BINARY;
Frame.OPCODE_CLOSE = OPCODE_CLOSE;
Frame.OPCODE_PING = OPCODE_PING;
Frame.OPCODE_PONG = OPCODE_PONG;

Frame.Frame = Frame;
Frame.Receiver = Receiver;
