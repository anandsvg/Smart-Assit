module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function getQuestionnaires(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				db.collection('questionnaires').find({
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
		}
	};

	function getQuestionnaire(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('questionnaires').findOne({
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

	function getQuestionnaireGroup(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				db.collection('questionnaires').find({
					serviceProvider: req.session.serviceProvider,
					group: req.body.group
				}, {
					_id: 1,
					title: 1
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

	function addQuestionnaire(req, $c) {
		if (req.session.serviceProvider) {
			useDb(function(db) {
				req.body.serviceProvider = req.session.serviceProvider;
				db.collection('questionnaires').insert(req.body, function(err, results) {
					$c(results[0]);
					db.close();
				});
			});
		}
	};

	function updateQuestionnaire(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('questionnaires').update({
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

	function removeQuestionnaire(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('questionnaires').remove({
				'_id': new mongodb.ObjectID(id)
			}, function() {
				$c();
				db.close();
			});
		});
	};

	return {
		getQuestionnaires: getQuestionnaires,
		getQuestionnaireGroup: getQuestionnaireGroup,
		getQuestionnaire: getQuestionnaire,
		addQuestionnaire: addQuestionnaire,
		updateQuestionnaire: updateQuestionnaire,
		removeQuestionnaire: removeQuestionnaire
	};

}();