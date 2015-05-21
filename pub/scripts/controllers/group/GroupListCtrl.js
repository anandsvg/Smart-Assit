define([
	'app',
	'/scripts/factories/GroupModel.js'
], function(app, GroupModel) {
	app.register.controller('GroupListCtrl', function(GroupModel, $http, $scope, $state) {
		var h = function(data) {
			$scope.groups = data;
		}

		if (!GroupModel.isLoaded()) {
			GroupModel.load(h);
		} else {
			h(GroupModel.get());
		}

		this.remove = function(_id) {
			GroupModel.remove(_id);
		};
	});
});