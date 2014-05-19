var Routes   = require('./routes')
  , mongoose = require('mongoose');

module.exports = AdminPanel;

function AdminPanel(options) {
	options = options || {};
}

AdminPanel.prototype.buildRoutes = function() {
	var app = this.app;

	Routes(app);

	var pageSchema = mongoose.model('Page');

	pageSchema.find(function(err, pages) {
		for(var i = 0; i < pages.length; i++) {
			var page = pages[i];

			app.get(page.slug, function(req, res) {
				res.render(page.template, page.data, function(err, html){
					res.type('html').end(html);
				});
			});
		}
	});
}