var  mongoose        = require('mongoose')
  ,  ApplicantSchema = require('./schemas').ApplicantSchema;

var Applicant  = mongoose.model('Applicant', ApplicantSchema);
module.exports = Applicant;