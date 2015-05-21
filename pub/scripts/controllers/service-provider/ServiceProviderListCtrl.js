define([
	'app',
	'/scripts/factories/ServiceProviderModel.js'
], function(app, ServiceProviderModel, CurrentState) {
	app.register.controller('ServiceProviderListCtrl', function(ServiceProviderModel, $http, $state) {
		var $this = this;
		$this.get = ServiceProviderModel.get;
		$this.companies = $this.get();
		$this.select = ServiceProviderModel.select;

		this.remove = function(_id) {
			ServiceProviderModel.remove(_id);
		};
	});
});