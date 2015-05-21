define([
	'app',
	'/scripts/factories/UserModel.js',
	'/scripts/factories/GroupModel.js'
], function(app) {
	app.register.controller('UserAddCtrl', function($scope, $interval, UserModel, GroupModel) {
		$scope.data = {
			groups: [],
			roles: []
		};
		$scope.groups = [];

		window.add = $scope.data;

		var ag = $interval(function() {
			if (GroupModel.isLoaded()) {
				_.each(GroupModel.get(), function(group) {
					$scope.groups.push({
						label: group.label,
						type: group.type,
						value: group._id,
						selected: false
					});
				});
				$interval.cancel(ag);
			}
		}, 0);
		$scope.$watch('groups', function(n, o) {
			$scope.data.groups = [];
			$scope.data.roles = [];
			_.each($scope.groups, function(b, a) {
				if (b.selected) {
					$scope.data.groups.push(b.value);
					if (_.indexOf($scope.data.roles, b.type) == -1) {
						$scope.data.roles.push(b.type);
					}
				}
			});
		}, true);


		$scope.add = function() {
			UserModel.add($scope.data);
		};
	});
});