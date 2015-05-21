module.exports = function() {
	var mongodb = require('mongodb'),
		useDb = require('./db'),
		fs = require('fs'),
		async = require('async'),
		_ = require('underscore');

	function login(req, $c) {
		var email = new RegExp('^' + req.body.email + '$', 'i'),
			password = require('crypto')
				.createHash('sha1')
				.update(req.body.password)
				.digest('hex'),
			isSiteLogin = new RegExp(DOMAIN_NAME, 'gi').test(req.headers.referer);

		useDb(function(db) {
			db.collection('users').findOne({
				email: email,
				password: password
			}, function(err, user) {
				if (err) {
					$c({
						status: 0
					});
					db.close();
					throw err;
				}
				// If login successful
				if (user) {

					console.log('isSiteLogin: ' + isSiteLogin);
					console.log(user.roles);

					// Check for roles to access admin panel					
					if (user.siteAdmin) {
						completeLogin(req, $c, user);
					} else if (isSiteLogin && _.intersection(['admin', 'siteAdmin'], user.roles) != false) {
						completeLogin(req, $c, user);
					} else if (!isSiteLogin) {
						completeLogin(req, $c, user);
					} else {
						$c({
							status: 3
						});
					}

					db.close();
					// Login failed
				} else {
					$c({
						status: 0
					});
					db.close();
				}
			});
		});
	};

	function loginDevice(req, $c) {
		console.log('login device');
		useDb(function(db) {
			var query = {};
			query['devices.' + req.body.uuid] = req.body.code;
			db.collection('users').findOne(query, function(err, user) {
				if (err) {
					throw err;
				}

				if (user) {
					console.log('found');
					completeLogin(req, $c, user);
				} else {
					console.log('not found');
					$c({
						status: 0
					});
				}
				db.close();
			})
		});
	};

	function completeLogin(req, $c, user) {
		console.log('complete login');
		var ret = {};
		// Check for device uuid

		useDb(function(db) {
			require('crypto').randomBytes(20, function(ex, buf) {
				if (req.body.uuid) {
					ret.code = buf.toString('hex');

					var update = {};
					update['devices.' + req.body.uuid] = ret.code;
					db.collection('users').update({
						'_id': user._id
					}, {
						$set: update
					}, function() {});
				}
				// Load session variables
				req.session.user = user._id.toString();
				req.session.name = user.firstName + ' ' + user.lastName;
				req.session.serviceProviders = user.serviceProviders;
				req.session.roles = user.roles;
				req.session.firstName = user.firstName;
				req.session.lastName = user.lastName;
				req.session.email = user.email;
				req.session.defaultServiceProvider = user.defaultServiceProvider;

				// General returns
				ret.user = user._id.toString();
				ret.firstName = user.firstName;
				ret.lastName = user.lastName;
				ret.email = user.email;
				ret.defaultServiceProvider = user.defaultServiceProvider;

				// Get service providers
				var sps = [];
				_.each(req.session.serviceProviders, function(v, k) {
					sps.push(new mongodb.ObjectID(k));
				});
				db.collection('serviceProviders').find({
					'_id': {
						$in: sps
					}
				}, {
					company: 1
				}).toArray(function(err, results) {
					if (err) {
						throw err;
					}

					_.each(results, function(result, x) {
						result.roles = req.session.serviceProviders[result._id].roles;
						result.groups = req.session.serviceProviders[result._id].groups;
						req.session.serviceProviders[result._id]._id = result._id;
						req.session.serviceProviders[result._id].company = result.company;
					});

					ret.serviceProviders = req.session.serviceProviders;

					// Is a site admin
					if (user.siteAdmin) {
						req.session.userType = 'siteAdmin';
						ret.status = 1;
						db.close();
						$c(ret);

						// Not a site admin
					} else {

						/***
						 **  USER TYPE WILL BE DEFAULT
						 **  AS USER...WILL HAVE SWITCH
						 **  FOR USER / AGENT FOR DIFFERENT
						 **  ROLES.
						 ****/
						if (_.indexOf(req.session.roles, 'admin') > -1) {
							req.session.userType = 'admin';
						} else {
							req.session.userType = 'user';
						}

						if (_.keys(req.session.serviceProviders).length == 1) {
							req.session.serviceProvider = _.first(_.keys(req.session.serviceProviders));

							db.collection('serviceProviders').findOne({
								'_id': new mongodb.ObjectID(req.session.serviceProvider)
							}, function(err, resa) {
								req.session.serviceProviderName = resa.company;
								ret.status = 1;
								db.close();
								$c(ret);
							});

						} else {
							ret.status = 1;
							db.close();
							$c(ret);
						}
					}
				});
			});
		});
	};

	function logout(req, $c) {
		req.session.destroy();
		$c();
	}

	function logoutDevice(req, $c) {
		useDb(function(db) {
			var devices = {};
			devices[req.body.uuid] = req.body.code;
			db.collection('users').update({
				'_id': new mongodb.ObjectID(req.session.user)
			}, {
				$set: devices
			}, function(err, results) {
				if (err) {
					throw err;
				}

				req.session.destroy();
				$c();
				db.close();
			});
		});
	}

	function get(req, $c) {
		$c({
			user: req.session.user,
			name: req.session.name,
			firstName: req.session.firstName,
			lastName: req.session.lastName,
			email: req.session.email,
			userType: req.session.userType,
			serviceProviders: req.session.serviceProviders,
			serviceProvider: (req.session.serviceProvider) ? req.session.serviceProvider : null,
			serviceProviderName: (req.session.serviceProviderName) ? req.session.serviceProviderName : null,
			defaultServiceProvider: req.session.defaultServiceProvider
		});
	}

	function getServiceProviders(req, $c) {
		useDb(function(db) {
			var sps = [];
			_.each(req.session.serviceProviders, function(v, k) {
				sps.push(new mongodb.ObjectID(k));
			});
			db.collection('serviceProviders').find({
				'_id': {
					$in: sps
				}
			}, {
				company: 1,
				profileFilled: 1
			}).toArray(function(err, results) {
				if (err) {
					throw err;
				}
				$c(results);
				db.close();
			});
		});
	}

	function selectServiceProvider(req, $c) {
		var id = req.route.params.id;
		req.session.serviceProvider = id;
        console.log("sp id"+id);
        console.log("session group id"+req.session.serviceProviders[req.session.serviceProvider].groups);
		useDb(function(db) {
			db.collection('serviceProviders').findOne({
				'_id': new mongodb.ObjectID(id)
			}, function(err, resa) {
				// Actions
				db.collection('actions').find({
					'serviceProvider': req.session.serviceProvider,
					'groups': {
						'$in': req.session.serviceProviders[req.session.serviceProvider].groups

					}
				}, {
					title: 1
				}).toArray(function(err, actions) {
					// CHECK IF USER PROFILE COMPLETED
                    console.log("actions"+actions);
					req.session.serviceProviderName = resa.company;
					$c({
						serviceProvider: id,
						serviceProviderName: resa.company,
						actions: actions,
						profileFilled: req.session.serviceProviders[req.session.serviceProvider].profileFilled
					});
					db.close();
				});
			});
		});
	}

	function getUserProfile(req, $c) {
		useDb(function(db) {
			db.collection('groups').findOne({
				serviceProvider: req.session.serviceProvider,
				type: 'user'
			}, function(err, group) {
				db.collection('questionnaires').findOne({
					_id: new mongodb.ObjectID(group.userProfile),
					serviceProvider: req.session.serviceProvider
				}, function(err, results) {
					if (err) {
						return console.dir(err);
					}

					// GET USER DATA
					db.collection('questionnaireData').findOne({
						user: req.session.user,
						serviceProvider: req.session.serviceProvider,
						questionnaire: results._id.toString()
					}, function(err, qdata) {
						if (err) {
							$c(results);
						} else {
							results.data = qdata;
							$c(results);
						}
						db.close();
					});
				});
			});
		});
	}

	function getAction(req, $c) {
		useDb(function(db) {
			db.collection('actions').findOne({
				_id: new mongodb.ObjectID(req.route.params.id),
				serviceProvider: req.session.serviceProvider
			}, function(err, results) {
				if (err) {
					return console.dir(err);
				}

				$c(results);
				db.close();
			});
		});
	}

	function forgotPassword(req, $c) {
		var email = new RegExp('^' + req.body.email + '$', 'i');
		useDb(function(db) {
			db.collection('users').findOne({
				'email': email
			}, function(err, user) {
				if (err) {
					throw err;
				}

				if (user) {
					// Check for registration token
					if (user.registrationToken) {

						require('./Email').sendEmail({
							to: user.email,
							subject: 'Your ' + SITE_NAME + ' Account',
							text: 'Activate your account by clicking here -->> http://' + DOMAIN_NAME + '/account/activate/' + user.registrationToken
						});
						$c({
							status: 1 // Activation email
						});
					} else if (user.password) {
						require('crypto').randomBytes(20, function(ex, buf) {
							var token = buf.toString('hex');

							db.collection('users').update({
								'email': email
							}, {
								$set: {
									'passwordToken': token
								}
							}, function(err, results) {
								require('./Email').sendEmail({
									to: user.email,
									subject: 'Your ' + SITE_NAME + ' Account',
									text: 'Reset your account password by clicking here -->> http://' + DOMAIN_NAME + '/account/password/' + token
								});

								$c({
									status: 2 // Reset password email
								})
							});
						});
					}
				} else {
					$c({
						status: 0 // No user found
					});
				}
				db.close();
			});
		});
	}

	function activate(req, $c) {
		var token = req.route.params.token;

		if (token.length == 40) {
			useDb(function(db) {
				db.collection('users').count({
					registrationToken: token
				}, function(err, count) {
					if (count == 1) {
						req.session.registrationToken = token;
						fs.readFile(__dirname + '/../pub/views/activate.html', function(err, html) {
							if (err) {
								throw err;
							}

							$c({
								status: 1,
								content: html
							});
						});
					} else {
						$c({
							status: 0,
						});
					}
					db.close();
				});
			});
		}
	}

	function password(req, $c) {
		var token = req.route.params.token;

		if (token.length == 40) {
			useDb(function(db) {
				db.collection('users').count({
					passwordToken: token
				}, function(err, count) {
					if (count == 1) {
						req.session.passwordToken = token;
						fs.readFile(__dirname + '/../pub/views/password.html', function(err, html) {
							if (err) {
								throw err;
							}

							$c({
								status: 1,
								content: html
							});
						});
					} else {
						$c({
							status: 0,
						});
					}
					db.close();
				});
			});
		}
	}

	function setPassword(req, $c) {
		useDb(function(db) {
			if (req.session.registrationToken) {

				var password = require('crypto')
					.createHash('sha1')
					.update(req.body.password)
					.digest('hex');


				db.collection('users').update({
						'registrationToken': req.session.registrationToken
					}, {
						$set: {
							password: password
						},
						$unset: {
							registrationToken: 1
						}
					},
					function() {
						$c({
							status: 1
						});
					});

			} else if (req.session.passwordToken) {
				var password = require('crypto')
					.createHash('sha1')
					.update(req.body.password)
					.digest('hex');

				db.collection('users').update({
						'passwordToken': req.session.passwordToken
					}, {
						$set: {
							password: password
						},
						$unset: {
							passwordToken: 1
						}
					},
					function() {
						$c({
							status: 1
						});
					});
			}
			db.close();
		});
	}

	function updatePassword(user, newPassword) {
		var password = require('crypto')
			.createHash('sha1')
			.update(newPassword)
			.digest('hex');

		useDb(function(db) {
			db.collection('users').update({
					_id: mongodb.ObjectID(user)
				}, {
					$set: {
						password: password
					}
				},
				function() {}
			);
		});
	}

	function changeEmailRequest(user, email, $c) {
		useDb(function(db) {
			require('crypto').randomBytes(20, function(ex, buf) {
				var token = buf.toString('hex');

				db.collection('users').count({
						email: email
					},
					function(error, count) {
						if (count < 1) {
							db.collection('users').update({
								_id: new mongodb.ObjectID(user)
							}, {
								$set: {
									changeEmail: email,
									changeEmailToken: token
								}
							}, function() {
								require('./Email').sendEmail({
									to: email,
									subject: 'Your ' + SITE_NAME + ' Email Change Request',
									text: 'Confirm your email change request by clicking here -->> http://' + DOMAIN_NAME + '/account/email/' + token
								});
							});
							$c({
								status: 1
							});
						} else {
							$c({
								status: 0
							});
						}
					}
				);


			});
		});
	}

	function changeEmail(req, $c) {
		useDb(function(db) {
			db.collection('users').findOne({
				changeEmailToken: req.params.token
			}, {
				changeEmail: 1,
				changeEmailToken: 1
			}, function(err, user) {
				if (user) {
					db.collection('users').update({
						changeEmailToken: req.params.token
					}, {
						$set: {
							email: user.changeEmail
						},
						$unset: {
							changeEmail: 1,
							changeEmailToken: 1
						}
					}, function() {
						fs.readFile(__dirname + '/../pub/views/email-change.html', function(err, html) {
							if (err) {
								throw err;
							}

							$c({
								status: 1,
								content: html
							});
						});
					});
				} else {
					$c({
						status: 0
					});
				}
			});
		});
	}

	function updateYourAccount(req, $c) {
		useDb(function(db) {
			var set = {};

			async.series({

					serviceProvider: function($$c) {
						// DEFAULT SERVICE PROVIDER			
						if (req.body.defaultServiceProvider) {
							var defaultServiceProvider = (req.body.defaultServiceProvider == 'none') ? '' : req.body.defaultServiceProvider;
							set.defaultServiceProvider = defaultServiceProvider;
							req.session.defaultServiceProvider = defaultServiceProvider;
						}

						// NAME
						set.firstName = req.body.firstName;
						set.lastName = req.body.lastName;
						$$c(null, {
							status: 1
						});
					},
					email: function($$c) {
						// EMAIL
						if (req.session.email != req.body.email) {
							changeEmailRequest(
								req.session.user,
								req.body.email,
								function(ret) {
									$$c(null, ret);
								}
							);
						} else {
							$$c(null, {
								status: 2
							});
						}
					},
					password: function($$c) {
						// PASSWORD
						if (req.body.password) {
							var pass = req.body.password;
							delete req.body.password;
							updatePassword(req.session.user, pass);
							$$c(null, {
								status: 1
							});
						} else {
							$$c(null, {
								status: 2
							});
						}
					}
				},
				function(error, result) {
					console.log(result);
					db.collection('users').update({
						_id: new mongodb.ObjectID(req.session.user)
					}, {
						$set: set
					}, function() {
						$c(result);
					});
				}
			)
		});
	};

	return {
		login: login,
		loginDevice: loginDevice,
		logout: logout,
		logoutDevice: logoutDevice,
		get: get,
		getServiceProviders: getServiceProviders,
		selectServiceProvider: selectServiceProvider,
		getUserProfile: getUserProfile,
		getAction: getAction,
		activate: activate,
		password: password,
		forgotPassword: forgotPassword,
		setPassword: setPassword,
		changeEmailRequest: changeEmailRequest,
		changeEmail: changeEmail,
		updateYourAccount: updateYourAccount
	};

}();