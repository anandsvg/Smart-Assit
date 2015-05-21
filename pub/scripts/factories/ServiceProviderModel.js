define([
	'app',
	'factories/CurrentState',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/factories/GroupModel.js',
	'/scripts/factories/UserModel.js'
], function(app) {
	app.register.factory('ServiceProviderModel', function($http, $state, QuestionnairesModel, GroupModel, UserModel, CurrentState) {
		var providers = [],
			loaded = false;

		function load() {
			$http.get('/service-provider')
				.success(function(data) {
					providers = data;
					loaded = true;
				});
		};

		function isLoaded() {
			return (loaded);
		}

		function get(_id) {
			if (_id) {
				return _.findWhere(providers, {
					_id: _id
				});
			} else {
				return providers;
			}
		}

		function add(data) {
			$http.post('/service-provider', data)
				.success(function(data) {
					providers.push(data);
					$state.go('service-provider');
				});
		};

		function update(_id, data) {
			$http.put('/service-provider/' + _id, data)
				.success(function() {
					providers[_.indexOf(_.pluck(providers, '_id'), _id)] = data;
					$state.go('service-provider');
				});
		}

		function remove(_id) {
			if (confirm("Remove?")) {
				$http.delete('/service-provider/' + _id)
					.success(function() {
						providers.splice(_.indexOf(_.pluck(providers, '_id'), _id), 1);
					});
			}
		};

		function select(_id) {
			$http.get('/service-provider/select/' + _id)
				.success(function(data) {
					CurrentState.set('serviceProvider', data.serviceProvider);
					CurrentState.set('serviceProviderName', data.serviceProviderName);
					GroupModel.load(function() {
						UserModel.load(function() {});
					});
					QuestionnairesModel.load(function() {
						$state.go('questionnaire');
					});
				});
		};

		load();

		return {
			load: load,
			get: get,
			add: add,
			update: update,
			remove: remove,
			select: select,
			isLoaded: isLoaded
		};
	});
});