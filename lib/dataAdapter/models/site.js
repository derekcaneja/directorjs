var  mongoose   = require('mongoose')
  ,  SiteSchema = require('./schemas').SiteSchema;

var Site = mongoose.model('Site', SiteSchema);
module.exports = Site;