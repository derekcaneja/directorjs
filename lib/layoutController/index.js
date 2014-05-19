var _ 	 	 = require('underscore')
  , path 	 = require('path')
  , mongoose = require('mongoose')
  , config   = require('../../config.json');

var cachedLayouts = {};

module.exports = LayoutController;

function LayoutController() {	
	this.templateAdapter = require('./templateAdapter');

	this.render = this.render.bind(this);
}

LayoutController.prototype.render = function(layout, data, callback) {
	if(!this.templateAdapter.app) {
		this.templateAdapter.app = this.app;
		this.templateAdapter.registerHelpers();
	}
	
	var _this = this;

	data = data || {};

	_.extend(data, { config: config });

	var pageSchema = mongoose.model('Page');

	var filename    = path.basename(layout, '.hbs');
	var searchTitle = filename.substring(0, 1).toUpperCase() + filename.substring(1);

	pageSchema.findOne({ title: searchTitle }, function(err, page) {
		if(page) {

			_.extend(page.header_data, { config: config, site: data.site });

			_this.getLayoutHtml(page.header, page.header_data, function(err, header) {
				_this.getLayoutHtml(layout, data, function(err, body) {
					var context = {
						title  : data.title || 'Handprint | Blog',
						header : header,
						body   : body,
						config : config,
						site   : data.site || null
					};

					_this.getLayoutHtml((data.layout) ? data.layout : '__blank', context, function(err, html) {
						if (err) return callback(err);

				    	callback(null, html);
					});
				});
			});
		} else {
			_this.getLayoutHtml(layout, data, function(err, body) {
				var context = {
					title  : data.title || 'Handprint | Blog',
					body   : body,
					config : config,
					site   : data.site || null
				};

				_this.getLayoutHtml((data.layout) ? data.layout : '__blank', context, function(err, html) {
					if (err) return callback(err);

			    	callback(null, html);
				});
			});
		}
	});
}

LayoutController.prototype.getLayoutHtml = function(layout, data, callback) {
	var cachedLayout = cachedLayouts[layout];

	if(cachedLayout) {
		var html = cachedLayout(data);

		return callback(null, html);
	}

	this.templateAdapter.getLayout(layout, this.app, function(err, template) {
		if(err) return callback(err);

		cachedLayouts[layout] = template;
		
		var html = template(data);

		callback(null, html)
	});
};