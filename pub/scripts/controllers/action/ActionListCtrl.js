define([
	'app',
	'/scripts/factories/ActionModel.js',
	'/scripts/factories/GroupModel.js'
], function(app) {
	app.register.controller('ActionListCtrl', function($scope, ActionModel, GroupModel) {
		var $this = this;
		$scope.actions = {};
		$scope.actionGroups = {};


		var h = function(data) {
			$scope.actions = data;
			var i = function() {
				_.each($scope.actions, function(action, index) {
					$scope.actionGroups[action._id] = [];
					_.each(action.groups, function(group) {
						$scope.actionGroups[action._id].push(GroupModel.getLabel(group));
					});
				});
			};
			if (!GroupModel.isLoaded()) {
				GroupModel.load(i);
			} else {
				i(GroupModel.get());
			}
		};

		if (!ActionModel.isLoaded()) {
			ActionModel.load(h);
		} else {
			h(ActionModel.get());
		}

		this.remove = function(_id) {
			ActionModel.remove(_id);
		};
	});
});