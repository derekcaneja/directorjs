// Dependencies
var Director = require('./lib/director');

// Config
var config = undefined;

try {
	config = require('./config.json');
} catch(e) {
	config = {};
}

module.exports.initialize = function(callback) {
	var nodeCMS = new NodeCMS(config);

	callback(null, nodeCMS);
}