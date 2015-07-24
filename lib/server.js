var util = require('util');
var http = require('http');
var events = require('events');
var stream = require('stream');
var crypto = require('crypto');
var frame = require('./frame');

function Server(server, connectListener) {
	if (util.isFunction(server)) {
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
	// this._connections = [];

	var that = this;
	server.on('upgrade', function(req, socket, upgradeHead) {
		var session = new Session(req, socket, upgradeHead);
		// this._connections.push(connection);
		that.emit('connection', session);
	});
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function() {
	this._server.listen.apply(this._server, arguments);
};


function Session(req, socket, upgradeHead) {
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

	this.connection = socket;
	this.on('ping', function() {
		this.sendPong();
	});
	this.on('end', function() {
		this.connection.end();
	});
	socket.on('close', function() {
		that.emit('close');
	});
	socket.write(headers.concat('', '').join('\r\n'));

	this._initReceiver();
}

util.inherits(Session, stream.Stream);

Session.prototype._initReceiver = function() {
	var that = this;
	var length = 0;
	var buffers = [];
	var binary = false;
	var receiver = new frame.Receiver();
	receiver.on('data', function(f) {
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
	this.connection.pipe(receiver);
};

Session.prototype.pause = function() {
	this.connection.pause();
};

Session.prototype.resume = function() {
	this.connection.resume();
};

Session.prototype.write = function(data, flags) {
	var buffer = new frame.Frame(data, flags).toBuffer();
	this.connection.write(buffer);
};

Session.prototype.send = Session.prototype.write;

Session.prototype.sendPing = function() {
	this.write(null, {
		opcode: frame.OPCODE_PING
	});
};

Session.prototype.sendPong = function() {
	this.write(null, {
		opcode: frame.OPCODE_PONG
	});
};

Session.prototype.end = function(data) {
	if (data !== undefined) {
		this.write(data);
	}
	this.write(null, {
		opcode: frame.OPCODE_CLOSE
	});
	this.connection.end();
};

Session.prototype.close = Session.prototype.end;

Session.prototype.destory = function() {
	this.connection.destory();
};

exports.Server = Server;

exports.Session = Session;