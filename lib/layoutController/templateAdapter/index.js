var Handlebars = require('handlebars');

// Export the `Handlebars` object, so other modules can add helpers, partials, etc.
module.exports.Handlebars = Handlebars;

// `getLayout` should only be used on the server.
module.exports.getLayout = require('./layoutFinder')(Handlebars).getLayout;

// Export function so other modules can register helpers as well.
module.exports.registerHelpers = function() {
	var helpersModule = require('./helpers');
	var helpers 	  = helpersModule(Handlebars, this.app, module.exports.getLayout);

	for (var key in helpers) {
		if (!helpers.hasOwnProperty(key)) continue;
		Handlebars.registerHelper(key, helpers[key]);
	}
};
