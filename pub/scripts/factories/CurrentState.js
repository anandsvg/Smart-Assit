angular.module('CurrentState', [])
	.factory('CurrentState', function($http, $state, $rootScope) {

		var $this = this;

		function load(c) {
			$this.data = {};
			$http.get('/account/get')
				.success(function(data) {
					$this.data = data;

					if (typeof c != 'undefined') {
						c();
					}
				});
		}

		function set(k, v) {
			$this.data[k] = v;
		}

		function get(k) {
			return $this.data[k];
		}

		function getServiceProviders($c) {
			$http.get('/account/service-providers')
				.success(function(data) {
					$c(data);
				});
		};

		function isServiceProviderSelected() {
			return ($this.data.serviceProvider && $this.data.serviceProvider != null);
		}

		function getServiceProviderSelected() {
			return {
				serviceProvider: $this.data.serviceProvider,
				serviceProviderName: $this.data.serviceProviderName
			};
		}

		function getUserType() {
			return $this.data.userType;
		};

		function getName() {
			return $this.data.name;
		}

		load();

		return {
			isServiceProviderSelected: isServiceProviderSelected,
			getServiceProviders: getServiceProviders,
			getServiceProviderSelected: getServiceProviderSelected,
			getUserType: getUserType,
			getName: getName,
			set: set,
			get: get,
			data: $this.data
		};
	});