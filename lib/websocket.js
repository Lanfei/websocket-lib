exports.Server = require('./server').Server;
exports.Client = require('./client').Client;
exports.Frame = require('./frame').Frame;

exports.createServer = function(server, connectListener) {
	return new exports.Server(server, connectListener);
}