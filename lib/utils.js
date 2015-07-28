var crypto = require('crypto');

function isType(type) {
	return function (obj) {
		return {}.toString.call(obj) === '[object ' + type + ']';
	};
}

exports.isObject = isType('Object');
exports.isString = isType('String');
exports.isNumber = isType('Number');
exports.isFunction = isType('Function');
exports.isArray = Array.isArray;

exports.getWSKey = function (key) {
	var shasum = crypto.createHash('sha1');
	return shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
};
