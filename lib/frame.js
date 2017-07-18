/*!
 * Frame Module
 * @author Lanfei
 * @module websocket-lib
 */
var util = require('util');
var stream = require('stream');

const OPCODE_CONTINUATION = 0;
const OPCODE_TEXT = 1;
const OPCODE_BINARY = 2;
const OPCODE_CLOSE = 8;
const OPCODE_PING = 9;
const OPCODE_PONG = 10;

/**
 * Each data frame follows this format:
 *<pre>
 *   0               1               2               3
 *   0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
 *  +-+-+-+-+-------+-+-------------+-------------------------------+
 *  |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 *  |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 *  |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 *  | |1|2|3|       |K|             |                               |
 *  +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 *  |     Extended payload length continued, if payload len == 127  |
 *  + - - - - - - - - - - - - - - - +-------------------------------+
 *  |                               |Masking-key, if MASK set to 1  |
 *  +-------------------------------+-------------------------------+
 *  | Masking-key (continued)       |          Payload Data         |
 *  +-------------------------------- - - - - - - - - - - - - - - - +
 *  :                     Payload Data continued ...                :
 *  + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 *  |                     Payload Data continued ...                |
 *  +---------------------------------------------------------------+
 *</pre>
 * @constructor
 * @param  {String|Buffer} data     The payload data.
 * @param  {Boolean}       [binary] If the data is binary.
 */
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

/**
 * Encode the frame data.
 * @return {Frame} this
 */
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

/**
 * Decode the frame data.
 * @return {Frame} this
 */
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

/**
 * Return a buffer of the Frame instance.
 * @return {Buffer}
 */
Frame.prototype.toBuffer = function () {
	var buffers = [];

	var length = this.length;
	if (this.length > 0xffff) {
		length = 127;
	} else if (this.length > 125) {
		length = 126;
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

/**
 * WebSocket Frame Receiver
 * @constructor
 * @extends stream.Duplex
 */
function Receiver() {
	stream.Duplex.call(this, {
		readableObjectMode: true
	});

	this._buffer = null;
	this._frame = new Frame();
	this._state = WAITING_FOR_HEADER;
}

util.inherits(Receiver, stream.Duplex);

Receiver.prototype._read = function () {
};

Receiver.prototype._write = function (buffer, encoding, callback) {
	if (this._buffer) {
		this._buffer = Buffer.concat([this._buffer, buffer]);
	} else {
		this._buffer = buffer;
	}
	this._parse();
	callback();
};

Receiver.prototype._parse = function () {
	var frame = this._frame;
	var buffer = this._buffer;
	if (!buffer || !buffer.length || this.isPaused()) {
		return;
	}
	if (this._state === WAITING_FOR_HEADER) {
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

		this._buffer = buffer = buffer.slice(2);

		if (frame.length === 126) {
			this._state = WAITING_FOR_16_BIT_LENGTH;
		} else if (frame.length === 127) {
			this._state = WAITING_FOR_64_BIT_LENGTH;
		} else {
			this._state = WAITING_FOR_MASK_KEY;
		}
	}
	if (this._state === WAITING_FOR_16_BIT_LENGTH) {
		if (buffer.length < 2) {
			return;
		}
		frame.length = buffer.readUIntBE(0, 2);
		this._buffer = buffer = buffer.slice(2);
		this._state = WAITING_FOR_MASK_KEY;
	}
	if (this._state === WAITING_FOR_64_BIT_LENGTH) {
		if (buffer.length < 8) {
			return;
		}
		frame.length = buffer.readUIntBE(0, 8);
		this._buffer = buffer = buffer.slice(8);
		this._state = WAITING_FOR_MASK_KEY;
	}
	if (this._state === WAITING_FOR_MASK_KEY) {
		if (frame.masked && buffer.length < 4) {
			return;
		}
		if (frame.masked) {
			frame.mask = buffer.slice(0, 4);
			this._buffer = buffer = buffer.slice(4);
		}
		this._state = WAITING_FOR_PAYLOAD;
	}
	if (this._state === WAITING_FOR_PAYLOAD) {
		if (buffer.length < frame.length) {
			return;
		}
		var length = frame.length;

		frame.data = buffer.slice(0, length);
		this._buffer = buffer = buffer.slice(length);
		this._state = COMPLETE;
	}
	if (this._state === COMPLETE) {
		/**
		 * @event Receiver#data
		 * @param {Frame} data The received WebSocket frame.
		 */
		this.push(frame);
		this._frame = new Frame();
		this._state = WAITING_FOR_HEADER;

		if (buffer.length) {
			process.nextTick(this._parse.bind(this));
		}
	}
};

module.exports = Frame;

/** @const */
Frame.OPCODE_CONTINUATION = Frame.prototype.OPCODE_CONTINUATION = OPCODE_CONTINUATION;
/** @const */
Frame.OPCODE_TEXT = Frame.prototype.OPCODE_TEXT = OPCODE_TEXT;
/** @const */
Frame.OPCODE_BINARY = Frame.prototype.OPCODE_BINARY = OPCODE_BINARY;
/** @const */
Frame.OPCODE_CLOSE = Frame.prototype.OPCODE_CLOSE = OPCODE_CLOSE;
/** @const */
Frame.OPCODE_PING = Frame.prototype.OPCODE_PING = OPCODE_PING;
/** @const */
Frame.OPCODE_PONG = Frame.prototype.OPCODE_PONG = OPCODE_PONG;

Frame.Frame = Frame;
Frame.Receiver = Receiver;
