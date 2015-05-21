module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function getServiceProviders(req, $c) {
		useDb(function(db) {
			db.collection('serviceProviders').find().toArray(function(err, results) {
				if (err) {
					return console.dir(err);
				}

				$c(results);
				db.close();
			});
		});
	};

	function selectServiceProvider(req, $c) {
		var id = req.route.params.id;
		req.session.serviceProvider = id;
		useDb(function(db) {
			db.collection('serviceProviders').findOne({
				'_id': new mongodb.ObjectID(id)
			}, function(err, resa) {
				req.session.serviceProviderName = resa.company;

				$c({
					serviceProvider: id,
					serviceProviderName: resa.company
				});
				db.close();
			});
		});
	};

	function removeServiceProvider(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('serviceProviders').remove({
				'_id': new mongodb.ObjectID(id)
			}, function() {
				$c();
				db.close();
			});
		});
	};

	function updateServiceProvider(req, $c) {
		var id = req.route.params.id,
			data = req.body;
		delete data._id;

		useDb(function(db) {
			db.collection('serviceProviders').update({
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

	function addServiceProvider(req, $c) {
		useDb(function(db) {
			var serviceProvider = {
				company: req.body.company,
				email: req.body.email
			};
			delete req.body.company;

			db.collection('serviceProviders').insert(serviceProvider, function(err, results) {
				var sp = results[0],
					serviceProviderId = sp._id.toString();

				// Create default groups
				var groups = [{
					type: 'admin',
					label: 'Admin'
				}, {
					type: 'user',
					label: 'User'
				}, {
					type: 'agent',
					label: 'Agent'
				}];
				groups.forEach(function(group) {
					group.serviceProvider = serviceProviderId;
					db.collection('groups').insert(group, function(err, results) {
						if (results[0].type == 'admin') {

							req.body.serviceProviders = {};
							req.body.serviceProviders[serviceProviderId] = {
								'roles': [
									'admin'
								],
								'groups': [
									results[0]._id.toString()
								]
							};
							req.body.roles = ['admin'];

							require('./User').add(req, function(ret) {
								$c(sp);
								db.close();
							});
						}
					});
				});
			});
		});
	};

	return {
		getServiceProviders: getServiceProviders,
		selectServiceProvider: selectServiceProvider,
		removeServiceProvider: removeServiceProvider,
		updateServiceProvider: updateServiceProvider,
		addServiceProvider: addServiceProvider
	};

}();