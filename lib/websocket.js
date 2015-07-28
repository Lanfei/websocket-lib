exports.Server = require('./server');
exports.Client = require('./client');
exports.Frame = require('./frame');
exports.Session = require('./session');

exports.createServer = function (server, connectListener) {
	return new exports.Server(server, connectListener);
};

exports.createConnection = exports.connect = function (options, callback) {
	return new exports.Client(options, callback);
};
