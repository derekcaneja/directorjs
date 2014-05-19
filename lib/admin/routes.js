var fs         = require('fs')
  , mongoose   = require('mongoose')
  , mysql      = require('mysql')
  , nodemailer = require('nodemailer')
  , config     = undefined;

try { 
    config = require('../../config.json'); 
} catch(e) { 
    config = undefined;
}

var mysqlDB = {
    host     : 'us-cdbr-east-05.cleardb.net',
    user     : 'bf92c6dba546c5',
    password : '8fa87611',
    database : 'heroku_6381eebbf3fac25'
}

var transport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: "dev@gethandprint.com",
        pass: "KANSAShandprint3D"
    }
});

module.exports = function(app) {

    app.get('/install', function(req, res) {
        res.render(__dirname + '/views/install.hbs', { layout: __dirname + '/views/__blank.hbs' }, function(err, html) {
            res.type('html').end(html);
        });
    });

    app.post('/attempt_install', function(req, res) {
        var title     = req.param('title');
        var url       = req.param('url');
        var urlSchema = req.param('urlSchema');

        config = { title: title, url: url, urlSchema: urlSchema, user: 'admin', pass: 'password' };

        var toWrite = JSON.stringify(config, null, 4);

        fs.writeFile(__dirname + '/../../config.json', toWrite, function(err){
            res.send(200);
        });
    });

    app.get('/signin', function(req, res){
        if(!config) res.redirect('/install');
        else {
            res.render(__dirname + '/views/signin.hbs', { layout: __dirname + '/views/__blank.hbs' }, function(err, html) {
                res.type('html').end(html)
            });
        }
    });

	app.get('/admin', function(req, res){  
        if (!req.session.user) res.redirect('/signin');
        else {
            var siteSchema = mongoose.model('Site');

            siteSchema.find(function(err, sites) {
        		res.render(__dirname + '/views/index.hbs', { layout: __dirname + '/views/__blank.hbs', sites: sites }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id', function(req, res) {
        if(!req.session.user) res.redirect('/signin');
        else {
            var id = req.param('id');

            var siteSchema = mongoose.model('Site');

            siteSchema.findOne({ _id: id }, function(err, site) {
                req.session.site = site;

                res.render(__dirname + '/views/site.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', site: site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/settings', function(req, res){      
        if(!req.session.user) res.redirect('/signin');
        else {
            res.render(__dirname + '/views/settings.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', site: req.session.site }, function(err, html) {
                res.type('html').end(html)
            });
        }
    });

    app.get('/sites/:id/pages', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var pageSchema = mongoose.model('Page');

            pageSchema.find({ site: req.session.site._id }, function(err, pages) {
                res.render(__dirname + '/views/pages.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', pages: pages, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/posts', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var postSchema = mongoose.model('Post');

            postSchema.find({ site: req.session.site._id }, function(err, posts) {
                res.render(__dirname + '/views/posts.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', posts: posts, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/authors', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var authorSchema = mongoose.model('Author');

            authorSchema.find({ site: req.session.site._id }, function(err, authors) {
                res.render(__dirname + '/views/authors.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', authors: authors, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/applicants', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var connection = mysql.createConnection(mysqlDB);

            connectAndQuery(connection, "SELECT * FROM users WHERE activated IS NULL", function(err, applicants) {
                res.render(__dirname + '/views/applicants.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', applicants: applicants, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/users', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var connection = mysql.createConnection(mysqlDB);

            connectAndQuery(connection, "SELECT * FROM users WHERE activated", function(err, users) {
                res.render(__dirname + '/views/users.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', users: users, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.post('/sites/:id/invite_applicant', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            var mailOptions = {
                from    : "Handprint ✔ <no-reply@gethandprint.com>",
                to      : req.param('email'),
                subject : "Handprint Activation ✔",
                html    : "<b>Hello world ✔</b>"
            }

            transport.sendMail(mailOptions, function(error, response){
                if(error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + response.message);
                }

                res.send(200);
            });
        }
    });

    app.get('/sites/:id/delete_applicant', function(req, res){         
        if(!req.session.user) res.redirect('/signin');
        else {
            res.redirect('/sites/' + req.session.site._id + '/applicants');
        }
    });

    app.get('/sites/:id/new_page', function(req, res){
        if(!req.session.user) res.redirect('/signin');
        else {
            getHeaders(function(err, headers) {
                getTemplates(function(err, templates){                    
                    res.render(__dirname + '/views/new_page.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', headers: headers, templates: templates, site: req.session.site }, function(err, html) {
                        res.type('html').end(html)
                    });
                });
            });
        }
    });

    app.get('/sites/:id/edit_page', function(req, res){
        var pageSchema = mongoose.model('Page');

        if(!req.session.user) res.redirect('/signin');
        else {
            pageSchema.findOne({ _id: req.param('id') }, function(err, page) {
                getHeaders(function(err, headers) {
                    getTemplates(function(err, templates){                    
                        res.render(__dirname + '/views/new_page.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', page: page, headers: headers, templates: templates, site: req.session.site }, function(err, html) {
                            res.type('html').end(html)
                        });
                    });
                });
            });
        }
    });

    app.get('/sites/:id/new_post', function(req, res){
        var authorSchema = mongoose.model('Author');

        if(!req.session.user) res.redirect('/signin');
        else {
            authorSchema.find(function(err, authors) {
                res.render(__dirname + '/views/new_post.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', authors: authors, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.get('/sites/:id/edit_post', function(req, res){
        if(!req.session.user) res.redirect('/signin');
        else {
            var postSchema   = mongoose.model('Post');

            postSchema.findOne({ _id: req.param('id') }, function(err, post) {
                var authorSchema = mongoose.model('Author');

                authorSchema.find(function(err, authors) {
                    res.render(__dirname + '/views/new_post.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', authors: authors, post: post, site: req.session.site }, function(err, html) {
                        res.type('html').end(html)
                    });
                });
            });
        }
    });

    app.get('/sites/:id/new_author', function(req, res){   
        if(!req.session.user) res.redirect('/signin');
        else {    
            res.render(__dirname + '/views/new_author.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', site: req.session.site }, function(err, html) {
                res.type('html').end(html)
            });
        }
    });

    app.get('/sites/:id/edit_author', function(req, res){   
        var authorSchema = mongoose.model('Author');

        if(!req.session.user) res.redirect('/signin');
        else {
            authorSchema.findOne({ _id: req.param('id') }, function(err, author) {
                res.render(__dirname + '/views/new_author.hbs', { layout: __dirname + '/views/__' + req.session.site.type + '_layout.hbs', author: author, site: req.session.site }, function(err, html) {
                    res.type('html').end(html)
                });
            });
        }
    });

    app.post('/attempt_signin', function(req, res) {
        if(req.param('user') == config.user && req.param('pass') == config.pass) {
        	req.session.user = true;
        	res.send(200);
        } else res.redirect('/signin');
    });

    app.get('/attempt_signout', function(req, res) {
    	req.session.user = false;
    	res.redirect('/signin')
    });

    app.post('/attempt_save_post', function(req, res){  
        var postSchema = mongoose.model('Post');

        var id = req.param('id');

        if(id) {
            postSchema.findOne({ _id: id }, function(err, post) {
                post.slug    = req.param('slug');
                post.title   = req.param('title');
                post.content = req.param('content');
                post.author  = req.param('author');                    
                post.tags    = req.param('tags');
                post.thumb   = req.param('thumb');
                post.image   = req.param('image');
                post.site    = req.session.site._id;
                
                post.save(function(err) {
                    res.send(200);
                });
            });
        } else {
            postSchema.find(function(err, posts) {
                var prev = posts[0];

                for(var i = 1; i < posts.length; i++) if(posts[i].timestamp > prev.timestamp) prev = posts[i];

                var params = {
                    slug      : req.param('slug'),
                    title     : req.param('title'),
                    content   : req.param('content'),
                    author    : req.param('author'),
                    tags      : req.param('tags'),
                    thumb     : req.param('thumb'),
                    image     : req.param('image'),
                    site      : req.session.site._id,
                    next      : null,
                    prev      : (prev) ? prev.toObject() : null,
                    timestamp : new Date() 
                };
                
                var newPost = new postSchema(params);

                if(prev) {
                    prev.next = params;

                    prev.save(function(err) {
                        newPost.save(function(err) {                
                            res.send(200);
                        });
                    });
                    
                } else {
                    newPost.save(function(err) {
                        res.send(200);
                    });
                }
            });  
        } 
    });

    app.post('/attempt_save_author', function(req, res){
        var authorSchema = mongoose.model('Author');

        var id = req.param('id');

        if(id) {
            authorSchema.findOne({ _id: id }, function(err, author){
                author.name         = req.param('name');
                author.email        = req.param('email');
                author.user         = req.param('user');
                author.image        = req.param('image');
                author.social_media = req.param('social_media');
                author.site         = req.session.site._id;

                author.save(function(err) {
                    res.send(200);
                });
            });
        } else {
            var params = {
                name         : req.param('name'),
                email        : req.param('email'),
                user         : req.param('user'),
                image        : req.param('image'),
                social_media : req.param('social_media'),
                site         : req.session.site._id,
            };

            var newAuthor = new authorSchema(params);

            newAuthor.save(function(err) {
                res.send(200);
            });
        }
    });

    app.post('/attempt_save_page', function(req, res){
        var pageSchema = mongoose.model('Page');

        var id = req.param('id');

        if(id) {
            pageSchema.findOne({ _id: id }, function(err, page){
                page.title       = req.param('title');
                page.slug        = req.param('slug');
                page.header      = req.param('header');
                page.template    = req.param('template');
                page.header_data = req.param('header_data');
                page.data        = req.param('data');
                page.site        = req.session.site._id;

                page.save(function(err) {
                    res.send(200);
                });
            });
        } else {
            var params = {
                title       : req.param('title'),
                slug        : req.param('slug'),
                header      : req.param('header'),
                template    : req.param('template'),
                header_data : req.param('header_data'),
                data        : req.param('data'),
                site        : req.session.site._id
            };

            var newPage = new pageSchema(params);

            newPage.save(function(err) {
                res.send(200)
            });
        }
    });

    app.post('/save_settings', function(req, res){       
        var title     = req.param('title');
        var urlSchema = req.param('urlSchema');
        var database  = req.param('database');

        config = { title: title, urlSchema: urlSchema, database: database, user: 'admin', pass: 'password' };

        var toWrite = JSON.stringify(config, null, 4);

        fs.writeFile(__dirname + '/../../config.json', toWrite, function(err){
            res.send(200);
        });
    });

    app.get('/delete_page', function(req, res){       
        var pageSchema = mongoose.model('Page');

        var id = req.param('id');

        pageSchema.findOne({ _id: id }, function(err, page) {
            page.remove();
            res.redirect('/sites/' + req.session.site._id + '/pages');
        });
    });

    app.get('/delete_post', function(req, res){
        var postSchema = mongoose.model('Post');

        var id = req.param('id');

        postSchema.findOne({ _id: id }, function(err, post) {
            var prevID = (post.prev) ? post.prev.id : null;
            var nextID = (post.next) ? post.next.id : null;

            if(prevID && nextID) {
                postSchema.findOne({ _id: prevID }, function(err, prevPost) {
                    postSchema.findOne({ _id: nextID }, function(err, nextPost) {
                        prevPost.next = nextPost.toObject();
                        nextPost.prev = prevPost.toObject();

                        prevPost.save(function(err) {
                            nextPost.save(function(err) {
                                post.remove();
                                res.redirect('/sites/' + req.session.site._id + '/posts');
                            });
                        });
                    });
                });
            } else if(prevID || nextID) {
                postSchema.findOne({ _id: prevID || nextID }, function(err, result) {
                    if     (prevID) result.next = post.next;
                    else if(nextID) result.prev = post.prev;

                    result.save(function(err){
                        post.remove();
                        res.redirect('/sites/' + req.session.site._id + '/posts');
                    });
                });
            } else {
                post.remove();
                res.redirect('/sites/' + req.session.site._id + '/posts');
            }
        });
    });

    app.get('/delete_author', function(req, res){       
        var authorSchema = mongoose.model('Author');

        var id = req.param('id');

        authorSchema.findOne({ _id: id }, function(err, author) {
            author.remove();
            res.redirect('/sites/' + req.session.site._id + '/authors');
        });
    });

    app.get('/get_template_properties', function(req, res){       
        var template   = req.param('template');
        
        getTemplateProperties(template, function(err, properties) {
            res.send({ properties: properties });
        });
    });

    function getTemplates(callback) {
        fs.readdir(app.get('views'), function(err, templates){
            if(err) return callback(err);

            var toReturn = [];

            for(var i = 0; i < templates.length; i++) {
                if(templates[i].substring(0, 1) != '_' && templates[i].substring(0, 1) != '.' && templates[i].substring(0, ('header').length) != 'header') {
                    toReturn.push({ name: templates[i].substring(0, templates[i].length - 4) });
                }
            }

            callback(null, toReturn);
        });
    }

    function getHeaders(callback) {
        fs.readdir(app.get('views'), function(err, templates){
            if(err) return callback(err);

            var toReturn = [];

            for(var i = 0; i < templates.length; i++) {
                if(templates[i].substring(0, ('header').length) == 'header') {
                    toReturn.push({ name: templates[i].substring(0, templates[i].length - 4) });
                }
            }

            callback(null, toReturn);
        });
    }

    function getTemplateProperties(template, callback) {
        fs.readFile(app.get('views') + '/' + template + '.hbs', 'utf8', function(err, html){
            if(err) return callback(err);

            var properties = [];

            var props = html.split('{{');

            for(var i = 0; i < props.length; i++) {
                props[i] = props[i].split('}}');

                if(props[i][0][0] == '{' && props[i][0] != '{post_preview') {
                    properties.push({ property: props[i][0].substring(1), type: 'html' });
                } else if(props[i][0].indexOf('<') == -1           && 
                          props[i][0].length > 0                   &&
                          props[i][0].substring(0, 5) != '#each'   &&
                          props[i][0].substring(0, 5) != '/each'   &&
                          props[i][0].substring(0, 3) != '#if'     &&
                          props[i][0].substring(0, 3) != '/if'     &&
                          props[i][0].substring(0, 7) != '#unless' &&
                          props[i][0].substring(0, 7) != '/unless' &&
                          props[i][0].substring(0, 6) != 'config'  &&
                          props[i][0] != 'slug'                    &&
                          props[i][0] != '{post_preview'             ) properties.push({ property: props[i][0], type: 'text' });
            }

            callback(null, properties);
        });
    }

    function connectAndQuery(connection, query, data, callback) {
        connection.connect(function(err) { 
            if(err) callback(err);
            else {
                if(arguments.length == 3) {
                    callback = data;

                    connection.query(query, function(err, result) {
                        if(err) callback(err);
                        else    callback(null, result);
                    });
                } else {
                    connection.query(query, data, function(err, result) {
                        if(err) callback(err);
                        else    callback(null, result);
                    });
                }

                connection.end();
            }
        });
    }

}