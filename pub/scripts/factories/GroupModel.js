define([
	'app'
], function(app) {
	app.register.factory('GroupModel', function($http, $state) {
		var groups = [],
			groupLabels = {},
			loaded = false;

		function load(c) {
			loaded = false;
			$http.get('/group/list')
				.success(function(data) {
					groups = data;
					_.each(groups, function(group) {
						groupLabels[group._id] = group.label;
					})
					loaded = true;
					if (typeof c != 'undefined') {
						c(groups);
					}
				});
		};

		function isLoaded() {
			return (loaded);
		}

		function get(_id, $c) {
			if (_id) {
				return _.findWhere(groups, {
					_id: _id
				});
			} else {
				return groups;
			}
		}

		function getLabel(_id) {
			return groupLabels[_id];
		};

		function add(data) {
			$http.post('/group', data)
				.success(function(data) {
					groups.push(data);
					$state.go('group');
				});
		};

		function update(_id, data) {
			$http.put('/group/' + _id, data)
				.success(function() {
					groups[_.indexOf(_.pluck(groups, '_id'), _id)] = data;
					$state.go('group');
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/group/' + _id)
					.success(function() {
						groups.splice(_.indexOf(_.pluck(groups, '_id'), _id), 1);
					});
			}
		};

		return {
			load: load,
			get: get,
			getLabel: getLabel,
			add: add,
			update: update,
			remove: remove,
			isLoaded: isLoaded
		};
	});
});