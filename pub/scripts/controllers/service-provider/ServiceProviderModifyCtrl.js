define([
	'app',
	'/scripts/factories/ServiceProviderModel.js'
], function(app, ServiceProviderModel) {
	app.register.controller('ServiceProviderModifyCtrl', function($scope, $stateParams, ServiceProviderModel) {
		var $this = this;
		$scope._id = $stateParams.id;
		$this.update = ServiceProviderModel.update;
		$scope.$watch(ServiceProviderModel.isLoaded, function() {
			$scope.data = ServiceProviderModel.get($scope._id);
		});
	});
});