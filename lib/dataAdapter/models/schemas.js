var mongoose 	= require('mongoose')
  , Schema   	= mongoose.Schema
  , Mixed    	= Schema.Types.Mixed
  , ObjectId 	= Schema.ObjectId;

var Site = new Schema({
    title       : String,
    url         : String,
    type        : String
});

Site.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.SiteSchema = Site;

var Page = new Schema({
    title       : String,
    slug        : String,
    header      : String,
    template    : String,
    header_data : Object,
    data        : Object,
    site        : String
});

Page.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.PageSchema = Page;

var Post = new Schema({
    slug       : String,
	title	   : String,
	content	   : String,
	author	   : String,
    tags       : String,
    thumb      : String,
    image      : String,
    next       : Object,
    prev       : Object,
	timestamp  : Date,
    site       : String
});

Post.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.PostSchema = Post;

var Author = new Schema({
	name	   	 : String,
    email        : String,
    user         : String,
    image        : String,
	social_media : Array,
    site        : String
});

Author.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.AuthorSchema = Author;

var Applicant = new Schema({
    email        : String,
    timestamp    : String,
    activation   : String
});

Applicant.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.ApplicantSchema = Applicant;

var User = new Schema({
    name         : String,
    email        : String,
    user         : String,
    image        : String,
    social_media : Array,
    site        : String
});

User.pre('save', function (next) {
    // Do something.
    next();
});

module.exports.UserSchema = User;