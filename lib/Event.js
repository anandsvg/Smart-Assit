module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function getEvents(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				db.collection('events').find({
					serviceProvider: req.session.serviceProvider
				}, {
					name: 1
				}).toArray(function(err, results) {
					if (err) {
						return console.dir(err);
					}

					$c(results);
					db.close();
				});
			});
		}
	};

	function getEvent(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('events').findOne({
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

	function addEvent(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				req.body.serviceProvider = req.session.serviceProvider;
				req.body.items = [];
				db.collection('events').insert(req.body, function(err, results) {

					// Handle implementations
					if (req.body.implements && req.body.implements.length > 0) {
						// Add User Cancel Action
						// Add User Notification

						// Add Agent Accept Action
						// Add Agent Decline Action
						// Add Agent Notification
					}


					$c(results[0]);
					db.close();
				});
			});
		}
	};

	function updateEvent(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('events').update({
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

	function removeEvent(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('events').remove({
				'_id': new mongodb.ObjectID(id)
			}, function() {
				$c();
				db.close();
			});
		});
	};

	return {
		getEvents: getEvents,
		getEvent: getEvent,
		addEvent: addEvent,
		updateEvent: updateEvent,
		removeEvent: removeEvent
	};

}();