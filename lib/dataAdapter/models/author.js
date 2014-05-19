var  mongoose     = require('mongoose')
  ,  AuthorSchema = require('./schemas').AuthorSchema;

var Author = mongoose.model('Author', AuthorSchema);
module.exports = Author;