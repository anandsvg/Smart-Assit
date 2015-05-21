define([
	'app'
], function(app) {
	app.register.factory('EventModel', function($http, $state) {
		var events = [],
			temp = {},
			loaded = false;

		function load(c) {
			loaded = false;
			$http.get('/event')
				.success(function(data) {
					events = data;
					loaded = true;
					if (typeof c != 'undefined') {
						c();
					}
				});
		};

		function isLoaded() {
			return (loaded);
		}

		function get(_id, callback) {
			if (_id) {
				$http.get('/event/' + _id)
					.success(function(data) {
						callback(data);
					});
			} else {
				return events;
			}
		}

		function add(data) {
			$http.post('/event', data)
				.success(function(data) {
					events.push(data);
					$state.transitionTo('event', {
						id: data._id
					});
				});
		};

		function update(_id, data) {
			$http.put('/event/' + _id, data)
				.success(function() {
					events[_.indexOf(_.pluck(events, '_id'), _id)] = data;
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/event/' + _id)
					.success(function() {
						events.splice(_.indexOf(_.pluck(events, '_id'), _id), 1);
					});
			}
		};

		function saveTemp(_id, data) {
			temp[_id] = data;
		};

		function loadTemp(_id) {
			return temp[_id];
		};

		return {
			load: load,
			get: get,
			add: add,
			update: update,
			remove: remove,
			isLoaded: isLoaded,
			saveTemp: saveTemp,
			loadTemp: loadTemp
		};
	})
});