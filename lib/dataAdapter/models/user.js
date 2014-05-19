var  mongoose   = require('mongoose')
  ,  UserSchema = require('./schemas').UserSchema;

var User = mongoose.model('User', UserSchema);
module.exports = User;