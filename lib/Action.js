module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function getActions(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				db.collection('actions').find({
					serviceProvider: req.session.serviceProvider
				}, {
					_id: 1,
					title: 1,
					groups: 1
				}).toArray(function(err, results) {
					if (err) {
						return console.dir(err);
					}

					$c(results);
					db.close();
				});
			});
		} else {
			$c();
		}
	};

	function getAction(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('actions').findOne({
				_id: new mongodb.ObjectID(id),
				serviceProvider: req.session.serviceProvider
			}, function(err, results) {
				if (err) {
					return console.dir(err);
				}

				$c(results);
				db.close();
			});
		});
	};

	function addAction(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				req.body.serviceProvider = req.session.serviceProvider;
				db.collection('actions').insert(req.body, function(err, results) {
					$c(results[0]);
					db.close();
				});
			});
		}
	};

	function updateAction(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('actions').update({
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

	function removeAction(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('actions').remove({
				'_id': new mongodb.ObjectID(id)
			}, function() {
				$c();
				db.close();
			});
		});
	};

	return {
		getActions: getActions,
		getAction: getAction,
		addAction: addAction,
		updateAction: updateAction,
		removeAction: removeAction
	};

}();