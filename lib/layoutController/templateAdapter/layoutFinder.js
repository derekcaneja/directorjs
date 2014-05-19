var fs = require('fs');

module.exports = function(Handlebars) {
    return {
        getLayout: function(name, app, callback) {
            var layoutPath = (name.substring(name.length - 3) == 'hbs') ? name : app.get('views') + '/' + name + '.hbs';

            fs.readFile(layoutPath, 'utf8', function (err, str) {
                if (err) return callback(err);
                
                var template = Handlebars.compile(str);
                callback(null, template);
            });
        }
    }
};
