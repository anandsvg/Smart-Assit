module.exports = function db(d) {
	var mongodb = require('mongodb'),
		config = require(__dirname + '/../config/mongodb.json');
	mongodb.connect(                                                       'mongodb://' + config.username + ':' + config.password + '@' + config.host + ':' + config.port + '/' + config.database, function(err, db) {
		if (err) throw err;
		d(db);
	});
};