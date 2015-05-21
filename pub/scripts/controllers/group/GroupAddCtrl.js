define([
	'app',
	'/scripts/factories/GroupModel.js'
], function(app) {
	app.register.controller('GroupAddCtrl', function(GroupModel, $scope) {
		$scope.data = {};
		this.add = GroupModel.add;
	});
});