module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function submitQuestionnaireData(req, $c) {
		var data = req.body;
		data.date = new Date().valueOf();

		useDb(function(db) {
			db.collection('questionnaireData').update({
				'user': req.body.user,
				'serviceProvider': req.body.serviceProvider,
				'questionnaire': req.body.questionnaire
			}, {
				$set: data
			}, {
				upsert: 1
			}, function(err, results) {
				// UPDATE USER AACCOUNT
				var set = {};
				set['serviceProviders.' + req.body.serviceProvider + '.profileFilled'] = new Date().valueOf();
				req.session.serviceProviders[req.body.serviceProvider].profileFilled = new Date().valueOf();
				db.collection('users').update({
					'_id': new mongodb.ObjectID(req.body.user)
				}, {
					$set: set
				}, function() {
					$c();
					db.close();
				});
			});
		});
	};

	function getQuestionnaireData(req, $c) {
		useDb(function(db) {
			db.collection('questionnaireData').findOne({
				'user': req.session.user,
				'serviceProvider': req.session.serviceProvider,
				'questionnaire': req.params.id
			}, function(err, results) {
				db.close();
				if (results) {
					$c(results);
				} else {
					$c();
				}
			});
		});
	};

	function invokeAction(req, $c) {
		console.log(req.body);
		useDb(function(db) {
			var data = req.body;
			data.date = new Date().valueOf();

			// Store action
			db.collection('actionData').insert(data, function() {
				db.close();
			});

			$c();
		});
	};

	function updateActive(req, $c) {
		useDb(function(db) {
			db.collection('users').update({
					_id: new mongodb.ObjectID(req.params.id)
				}, {
					$set: {
						lastActive: new Date().valueOf()
					}
				},
				function() {

					db.close();
					$c();
				}
			);
		});
	};

	return {
		submitQuestionnaireData: submitQuestionnaireData,
		getQuestionnaireData: getQuestionnaireData,
		invokeAction: invokeAction,
		updateActive: updateActive
	};

}();