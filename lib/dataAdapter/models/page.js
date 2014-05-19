var  mongoose     = require('mongoose')
  ,  PageSchema = require('./schemas').PageSchema;

var Page = mongoose.model('Page', PageSchema);
module.exports = Page;