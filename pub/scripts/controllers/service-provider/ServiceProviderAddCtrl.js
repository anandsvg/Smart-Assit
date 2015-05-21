define([
	'app',
	'/scripts/factories/ServiceProviderModel.js'
], function(app) {
	app.register.controller('ServiceProviderAddCtrl', function(ServiceProviderModel, $scope) {
		this.add = ServiceProviderModel.add;
		$scope.data = {};
	});
});