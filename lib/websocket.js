/*!
 * WebSocket
 * @author Lanfei
 * @module websocket
 */

exports.Server = require('./server');
exports.Client = require('./client');
exports.Frame = require('./frame');
exports.Session = require('./session');

/**
 * Create a WebSocket Server.
 * @method createServer
 * @param  {Object}   [options]
 * @param  {Object}   [options.httpServer]        see {@link Server#httpServer}
 * @param  {Boolean}  [options.autoAccept = true] see {@link Server#autoAccept}
 * @param  {Function} [sessionListener]           A listener for the 'session' event.
 * @return {Server}
 */
exports.createServer = function (options, sessionListener) {
	return new exports.Server(options, sessionListener);
};

/**
 * An alias of {@link createConnection}.
 * @method connect
 * @param  {Object|String} [options]
 * @param  {Function}      [connectListener]
 * @return {Client}
 */
/**
 * Create a connection to the WebSocket Server.
 * @method createConnection
 * @param  {Object|String} [options]                  If options is a string, it is automatically parsed with url.parse().
 * @param  {String}        [options.host = localhost] A domain name or IP address of the server.
 * @param  {Number}        [options.port = 80|443]    Port of remote server.
 * @param  {Object}        [options.headers]          Headers to be sent to the server.
 * @param  {Function}      [connectListener]          A listener for the 'connect' event.
 * @return {Client}
 */
exports.createConnection = exports.connect = function (options, connectListener) {
	return new exports.Client(options, connectListener);
};
