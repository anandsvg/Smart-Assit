define([
	'app',
	'/scripts/factories/UserModel.js',
	'/scripts/factories/GroupModel.js'
], function(app, UserModel) {
	app.register.controller('UserListCtrl', function(UserModel, GroupModel, $interval, $http, $scope, $state) {
		$scope.userGroups = {};

		var h = function(data) {
			$scope.users = data;
			var i = function() {
				_.each($scope.users, function(user, index) {
					$scope.userGroups[user._id] = [];
					_.each(user.serviceProvider.groups, function(group) {
						$scope.userGroups[user._id].push(GroupModel.getLabel(group));
					});
				});
			};
			if (!GroupModel.isLoaded()) {
				GroupModel.load(i);
			} else {
				i(GroupModel.get());
			}
		};

		if (!UserModel.isLoaded()) {
			UserModel.load(h);
		} else {
			h(UserModel.get());
		}

		$scope.remove = function(_id) {
			UserModel.remove(_id);
		};
	});
});