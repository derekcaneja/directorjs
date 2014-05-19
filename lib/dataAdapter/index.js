var models   = require('./models');

module.exports = DataAdapter;

function DataAdapter(options) {
    this.options = options || {};
}

DataAdapter.prototype.request = function(req, api, callback) {
    var _this = this;

    var model  = this.getModel(api);
    var method = api.method.toLowerCase().replace('delete', 'del');
    
    model[method](req, api, function(err, body) {

        var res = {
            statusCode: 200
        };

        if(err) {
            res.statusCode = err;
            _this.getErrForResponse(res);            
        }

        callback(err, res, body);
    });
};

DataAdapter.prototype.getModel = function(api) {
	// var modelName = api.path.split('/')[1].slice(0, -1);

	// modelName = modelName.substring(0, 1).toUpperCase() + modelName.substring(1);
	return models['Post'];
}

// Convert 4xx, 5xx responses to be errors.
DataAdapter.prototype.getErrForResponse = function(res, options) {
	var status = res.statusCode;
 	var err    = new Error(status + " status");
		
	err.status = status;
	err.body   = res.body;
	
	return err;
};