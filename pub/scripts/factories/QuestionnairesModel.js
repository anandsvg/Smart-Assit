define([
	'app'
], function(app) {
	app.register.factory('QuestionnairesModel', function($http, $state) {
		var questionnaires = [],
			temp = {},
			loaded = false;

		function load(c) {
			loaded = false;
			$http.get('/questionnaire')
				.success(function(data) {
					questionnaires = data;
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
				$http.get('/questionnaire/' + _id)
					.success(function(data) {
						callback(data);
					});
			} else {
				return questionnaires;
			}
		}

		function getGroup(_id, callback) {
			$http.get('/questionnaire/group/' + _id)
				.success(function(data) {
					callback(data);
				});
		}

		function add(data) {
			$http.post('/questionnaire', data)
				.success(function(data) {
					questionnaires.push(data);
					$state.transitionTo('questionnaire/preview', {
						id: data._id
					});
				});
		};

		function update(_id, data) {
			$http.put('/questionnaire/' + _id, data)
				.success(function() {
					questionnaires[_.indexOf(_.pluck(questionnaires, '_id'), _id)] = data;
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/questionnaire/' + _id)
					.success(function() {
						questionnaires.splice(_.indexOf(_.pluck(questionnaires, '_id'), _id), 1);
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
			getGroup: getGroup,
			add: add,
			update: update,
			remove: remove,
			isLoaded: isLoaded,
			saveTemp: saveTemp,
			loadTemp: loadTemp
		};
	});
});