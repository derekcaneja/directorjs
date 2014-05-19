// Dependencies
var _ 		 = require('underscore')
  , mongoose = require('mongoose');

// NodeCMS Components
var AdminPanel		 = require('./admin') 
  ,	DataAdapter 	 = require('./dataAdapter')
  , LayoutController = require('./layoutController');

module.exports = Director;

function Director(config) {
	config = config || {};
	
	this.database  = config.database  || null;
	this.urlSchema = config.urlSchema || '/posts/:slug';

	this.adminPanel 	  = new AdminPanel();
	this.dataAdapter 	  = new DataAdapter();
	this.layoutController = new LayoutController();
}

Director.prototype.start = function(callback) {
	if(this.database) this.initDatabase();

	this.adminPanel.app 	  = this.app;
	this.layoutController.app = this.app;

	this.adminPanel.buildRoutes();
	this.buildApiRoutes();

	callback();
};

// Init Mongo Database Connection
Director.prototype.initDatabase = function() {
	this.connection = mongoose.connect('mongodb://' + this.database.user + ':' + this.database.pass + '@' + this.database.host);
}

Director.prototype.buildApiRoutes = function() {
	var app = this.app;

	var goNext = function(req, res, next) {
        next();
    };

    app.get(this.urlSchema, goNext);
    app.put(this.urlSchema, goNext);
    app.del(this.urlSchema, goNext);
    app.post(this.urlSchema, goNext);

    var fnChain = [this.apiProxy()];

    fnChain.forEach(function(fn) {
        app.use('/', fn);
    });

    app.get('/', function(req, res){
        var postSchema = mongoose.model('Post');

        postSchema.find(function(err, posts){
            var postPreviews = [];
            
            for(var i = 0; i < Math.min(posts.length, 3); i++) postPreviews.push(posts[i].toObject());

            res.render('index', { post_previews: postPreviews }, function(err, html) {
                res.type('html').end(html);
            });
        }); 
    });
}

Director.prototype.apiProxy = function() {
	var _this = this;
	var app   = this.app;

	return function(req, res, next) {
		var api = _.pick(req, 'query', 'method', 'body');

		api.path = req.path;

		_this.dataAdapter.request(req, api, function(err, response, body) {
			if(err) return next(err);

			var authorSchema = mongoose.model('Author');

			authorSchema.findOne({ name: body.author }, function(err, author) {
				author = author || {};
				
				body.social_media = author.social_media;
				body.author_image = author.image;

				res.render('post', body, function(err, html) {
					res.type('html').end(html)
				});
			});
		});
	};
};