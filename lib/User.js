module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		_ = require('underscore');

	function add(req, $c) {
		useDb(function(db) {
			if (!req.body.serviceProviders) {
				req.body.serviceProviders = {};
				req.body.serviceProviders[req.session.serviceProvider] = {
					groups: req.body.groups,
					roles: req.body.roles
				};
				//delete req.body.groups;
			}

			// Check for email existance
			db.collection('users').findOne({
				email: RegExp('^' + req.body.email + '$', 'i')
			}, function(err, user) {

				// User already exists
				// Just do an update
				if (user) {
                    $c({'error':'user already exists'});
                    console.log('user already exists');
					//Anandh//var serviceProviderId = _.first(_.keys(req.body.serviceProviders));
					//_.each(_.union(req.body.serviceProviders[serviceProviderId].roles, user.roles), function(b, a) {
					//	user.roles.push(b);
					//});
                    //
					//var set = {
					//	roles: user.roles
					//};
					//set['serviceProviders.' + serviceProviderId] = {
					//	roles: req.body.serviceProviders[serviceProviderId].roles,
					//	groups: req.body.serviceProviders[serviceProviderId].groups
					//};
					//db.collection('users').update({
					//		'_id': user._id
					//	}, {
					//		$set: set
					//	},
					//	function(err, results) {
					//		user.serviceProvider = user.serviceProviders[serviceProviderId];
					//		delete user.serviceProviders;
					//		$c(user);
					//		db.close();
					//	}
					//);
				}
				// No user...do an insert
				else {
					require('crypto').randomBytes(20, function(ex, buf) {
						req.body.registrationToken = buf.toString('hex');

						db.collection('users').insert(req.body, function(err, results) {
                            console.log("sending mail");
							require('./Email').sendEmail({
								to: req.body.email,
								subject: 'Your SmartAssist Account',
								text: 'Activate your account by clicking here -->> http://' + DOMAIN_NAME + '/account/activate/' + req.body.registrationToken
							});

							results[0].serviceProvider = results[0].serviceProviders[req.session.serviceProvider];
							delete results[0].serviceProviders;

							$c(results[0]);
							db.close();
						});
					});
				}
			});
		});
	}

	function remove(req, $c) {
		var id = req.route.params.id;
		useDb(function(db) {
			db.collection('users').remove({
				'_id': new mongodb.ObjectID(id),
				'company': req.session.company
			}, function() {
				$c();
				db.close();
			});
		});

	}

	function update(req, $c) {
		var id = req.route.params.id,
			data = req.body,
			allRoles = [],
			roles = data.serviceProvider.roles;
		delete data._id;

		useDb(function(db) {
			db.collection('users').findOne({
					'_id': new mongodb.ObjectID(id)
				}, {
					'serviceProviders': 1
				},
				function(err, user) {

					_.each(user.serviceProviders, function(sp, spId) {
						if (spId != req.session.serviceProvider) {
							_.each(_.difference(sp.roles, allRoles), function(b, a) {
								allRoles.push(b);
							});
						}
					});

					_.each(_.difference(data.serviceProvider.roles, allRoles), function(b, a) {
						allRoles.push(b);
					});

					// Groups && Roles		
					data['serviceProviders.' + req.session.serviceProvider + '.groups'] = data.serviceProvider.groups;
					data['serviceProviders.' + req.session.serviceProvider + '.roles'] = data.serviceProvider.roles;
					data.roles = allRoles;
					delete data.serviceProvider;

					db.collection('users').update({
							'_id': new mongodb.ObjectID(id)
						}, {
							$set: data
						},
						function(err, results) {
							if (err) {
								$c({
									status: 0
								})

							}
							$c({
								status: 1
							});
							db.close();
						}
					);
				}
			)
		});
	};

	function get(req, $c) {
		useDb(function(db) {
			var query = {
				'_id': mongodb.ObjectID.createFromHexString(req.route.params.id)
			};
			query['serviceProviders.' + req.session.serviceProvider] = {
				$exists: 1
			};
			db.collection('users').findOne(query, {
				password: 0
			}, function(err, user) {
				user.serviceProvider = user.serviceProviders[req.session.serviceProvider];
				delete user.serviceProviders;

				if (err) {
					return console.dir(err);
				}

				$c(user);
				db.close();
			})
		});
	};

	function list(req, $c) {
		useDb(function(db) {
			var query = {};
			query['serviceProviders.' + req.session.serviceProvider] = {
				$exists: 1
			};
			db.collection('users').find(query, {
				password: 0
			}).sort({
				lastName: 1
			}).toArray(function(err, results) {
				_.each(results, function(v, k) {
					var sp = v.serviceProviders[req.session.serviceProvider];
					v.serviceProvider = {
						groups: sp.groups,
						roles: sp.roles
					};
					results[k] = v;
					delete v.serviceProviders;
				});


				db.close();
				if (err) {
					return console.dir(err);
				}

				$c(results);
			});
		});
	};

	return {
		add: add,
		remove: remove,
		update: update,
		get: get,
		list: list
	};

}();