var util = require('util');
var http = require('http');
var events = require('events');
var crypto = require('crypto');
var Stream = require('stream');
var frame = require('./frame');

function Server(server, connectListener) {
	Stream.call(this);
	if (typeof server === 'function') {
		connectListener = server;
		server = null;
	}
	if (!server) {
		server = http.createServer();
	}
	if (connectListener) {
		this.on('connection', connectListener);
	}

	this._server = server;

	var that = this;
	server.on('upgrade', function (req, socket) {
		var session = new Session(req, socket);
		that.emit('connection', session);
	});
	server.on('listening', function () {
		that.emit('listening');
	});
	server.on('close', function () {
		that.emit('close');
	});
	server.on('error', function (error) {
		that.emit('error', error);
	});
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function () {
	this._server.listen.apply(this._server, arguments);
};

Server.prototype.close = function (callback) {
	this._server.close(callback);
};


function Session(req, socket) {
	var that = this;
	var shasum = crypto.createHash('sha1');
	var key = req.headers['sec-websocket-key'];
	var acceptance = shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
	var headers = [
		'HTTP/1.1 101 Switching Protocols',
		'Upgrade: websocket',
		'Connection: Upgrade',
		'Sec-WebSocket-Accept:' + acceptance
	];

	this.socket = socket;
	this.connection = socket;

	this.readable = true;
	this.writable = true;

	this.on('ping', function () {
		this.sendPong();
	});
	this.on('end', function () {
		this.socket.end();
	});
	socket.on('close', function () {
		that.emit('close');
	});
	socket.on('error', function (error) {
		that.emit('error', error);
	});
	socket.write(headers.concat('', '').join('\r\n'));

	this._initReceiver();
}

util.inherits(Session, Stream);

Session.prototype._initReceiver = function () {
	var that = this;
	var length = 0;
	var buffers = [];
	var binary = false;
	var receiver = new frame.Receiver();
	receiver.on('data', function (f) {
		var data;
		if (f.opcode === frame.OPCODE_CONTINUATION) {
			data = f.data;
		} else if (f.opcode === frame.OPCODE_TEXT) {
			data = f.data;
			binary = false;
		} else if (f.opcode === frame.OPCODE_BINARY) {
			data = f.data;
			binary = true;
		} else if (f.opcode === frame.OPCODE_CLOSE) {
			that.emit('end');
		} else if (f.opcode === frame.OPCODE_PING) {
			that.emit('ping');
		} else if (f.opcode === frame.OPCODE_PONG) {
			that.emit('pong');
		}
		if (!data) {
			return;
		}

		buffers.push(f.data);
		length += f.data.length;

		if (f.fin) {
			data = Buffer.concat(buffers, length);
			if (binary) {
				that.emit('data', data);
			} else {
				that.emit('data', data.toString());
			}
			buffers = [];
		}
	});
	this._receiver = receiver;
	this.socket.pipe(receiver);
};

Session.prototype.pause = function () {
	this.socket.pause();
};

Session.prototype.resume = function () {
	this.socket.resume();
};

Session.prototype.setNoDelay = function (noDelay) {
	this.socket.setNoDelay(noDelay);
};

Session.prototype.setEncoding = function (encoding) {
	this._receiver.setEncoding(encoding);
	this.socket.setEncoding(encoding);
};

Session.prototype.write = function (data, encoding, callback) {
	var f = new frame.Frame(data);
	this.sendFrame(f, encoding, callback);
};

Session.prototype.send = function (data, flags) {
	var f = new frame.Frame(data, flags);
	this.sendFrame(f);
};

Session.prototype.sendFrame = function (frame) {
	this.socket.write(frame.toBuffer());
};

Session.prototype.sendPing = function () {
	var f = new frame.Frame();
	f.opcode = frame.OPCODE_PING;
	this.sendFrame(f);
};

Session.prototype.sendPong = function () {
	var f = new frame.Frame();
	f.opcode = frame.OPCODE_PONG;
	this.sendFrame(f);
};

Session.prototype.close = function () {
	var f = new frame.Frame();
	f.opcode = frame.OPCODE_CLOSE;
	this.sendFrame(f);
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

module.exports = Server;
Server.Server = Server;
Server.Session = Session;