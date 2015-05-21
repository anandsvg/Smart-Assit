define([
	'app',
	'/scripts/factories/UserModel.js',
	'/scripts/factories/GroupModel.js',
], function(app, UserModel) {
	app.register.controller('UserModifyCtrl', function($scope, $stateParams, $interval, UserModel, GroupModel) {
		var $this = this;
		window.modify = $scope;
		$scope._id = $stateParams.id;

		$scope.update = function() {
			UserModel.update($scope._id, $scope.data);
		};

		$scope.$watch('groups', function(n, o) {
			var groups = [],
				roles = [];
			_.each($scope.groups, function(b, a) {
				if (b.selected === true) {
					if (_.indexOf($scope.data.serviceProvider.groups, b.value) == -1) {
						$scope.data.serviceProvider.groups.push(b.value);
					}
					if (_.indexOf($scope.data.serviceProvider.roles, b.type) == -1) {
						$scope.data.serviceProvider.roles.push(b.type);
					}
				} else {
					$scope.data.serviceProvider.groups = _.without($scope.data.serviceProvider.groups, b.value);
					$scope.data.serviceProvider.roles = _.without($scope.data.serviceProvider.roles, b.type);
				}
			});
		}, true)

		$scope.$watch(UserModel.isLoaded, function() {
			var ag = $interval(function() {
				if (GroupModel.isLoaded()) {
					UserModel.get($scope._id, function(data) {
						$scope.data = data;
						$scope.groups = [];
						_.each(GroupModel.get(), function(group) {
							$scope.groups.push({
								label: group.label,
								type: group.type,
								value: group._id,
								selected: (_.indexOf($scope.data.serviceProvider.groups, group._id) > -1)
							});
						});
					});
					$interval.cancel(ag);
				}
			}, 0);
		});
	});
});