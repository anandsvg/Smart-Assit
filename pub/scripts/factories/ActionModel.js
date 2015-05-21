define([
	'app'
], function(app) {
	app.register.factory('ActionModel', function($http, $state) {
		var actions = [],
			temp = {},
			loaded = false;

		function load(c) {
			loaded = false;
			$http.get('/action')
				.success(function(data) {
					actions = data;
					loaded = true;
					if (typeof c != 'undefined') {
						c(data);
					}
				});
		};

		function isLoaded() {
			return (loaded);
		}

		function get(_id, callback) {
			if (_id) {
				$http.get('/action/' + _id)
					.success(function(data) {
						callback(data);
					});
			} else {
				return actions;
			}
		}

		function add(data) {
			$http.post('/action', data)
				.success(function(data) {
					actions.push(data);
					$state.transitionTo('action/preview', {
						id: data._id
					});
				});
		};

		function update(_id, data) {
			$http.put('/action/' + _id, data)
				.success(function() {
					actions[_.indexOf(_.pluck(actions, '_id'), _id)] = data;
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/action/' + _id)
					.success(function() {
						actions.splice(_.indexOf(_.pluck(actions, '_id'), _id), 1);
					});
			}
		};

		function saveTemp(_id, data) {
			temp[_id] = data;
		};

		function loadTemp(_id) {
			return temp[_id];
		};

		function deleteTemp(_id) {
			delete temp[_id];
		};

		return {
			load: load,
			get: get,
			add: add,
			update: update,
			remove: remove,
			isLoaded: isLoaded,
			saveTemp: saveTemp,
			loadTemp: loadTemp,
			deleteTemp: deleteTemp
		};
	});
});