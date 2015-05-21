define([
	'app',
	'/scripts/factories/GroupModel.js',
], function(app) {
	app.register.factory('UserModel', function($http, $state, $interval, GroupModel) {
		var users = [],
			allGroups = [],
			loaded = false;

		function load(c) {
			loaded = false;
			$http.get('/user/list')
				.success(function(data) {
                    console.log(data);
					users = data;
					loadGroups();
					loaded = true;

					if (typeof c != 'undefined') {
						c(data);
					}
				});
		};

		function isLoaded() {
			return (loaded);
		}

		function get(_id, $c) {
			if (_id) {
				$http.get('/user/' + _id)
					.success(function(data) {
						$c(data);
					});
			} else {
				return users;
			}
		}

		function loadGroups() {
			var ag = $interval(function() {
				if (GroupModel.isLoaded()) {
					_.each(GroupModel.get(), function(group) {
						allGroups.push({
							label: group.label,
							type: group.type,
							value: group._id,
							selected: false
						});
					});
					$interval.cancel(ag);
				}
			}, 0);
		}

		function getGroups() {
			return allGroups;
		}

		function add(data) {
			$http.post('/user', data)
				.success(function(data) {
					users.push(data);
					$state.go('user');
				});
		};

		function update(_id, data) {
			$http.put('/user/' + _id, data)
				.success(function() {
					users[_.indexOf(_.pluck(users, '_id'), _id)] = data;
					$state.go('user');
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/user/' + _id)
					.success(function() {
						users.splice(_.indexOf(_.pluck(users, '_id'), _id), 1);
					});
			}
		};

		return {
			load: load,
			get: get,
			add: add,
			update: update,
			remove: remove,
			getGroups: getGroups,
			isLoaded: isLoaded
		};
	});
});