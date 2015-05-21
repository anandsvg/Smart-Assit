module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function getGroups(req, $c) {
		useDb(function(db) {
			db.collection('groups').find({
				serviceProvider: req.session.serviceProvider
			}).toArray(function(err, results) {
				if (err) {
					return console.dir(err);
				}

				$c(results);
				db.close();
			});
		});
	};

	function removeGroup(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('groups').remove({
				'_id': new mongodb.ObjectID(id),
				'serviceProvider': req.session.serviceProvider
			}, function() {
				$c();
				db.close();
			});
		});
	};

	function addGroup(req, $c) {
		useDb(function(db) {
			req.body.serviceProvider = req.session.serviceProvider;
			db.collection('groups').insert(req.body, function(err, results) {
				$c(results[0]);
				db.close();
			});
		});
	}

	function updateGroup(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('groups').update({
					'_id': new mongodb.ObjectID(id)
				}, {
					$set: data
				},
				function(err, results) {
					if (err) {
						return console.dir(err);
					}
					$c();
					db.close();
				}
			);
		});
	};

	return {
		getGroups: getGroups,
		addGroup: addGroup,
		updateGroup: updateGroup,
		removeGroup: removeGroup
	};
}();