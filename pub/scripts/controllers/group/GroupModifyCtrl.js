define([
	'app',
	'/scripts/factories/GroupModel.js',
	'/scripts/factories/QuestionnairesModel.js'
], function(app, GroupModel) {
	app.register.controller('GroupModifyCtrl', function($scope, $stateParams, GroupModel, QuestionnairesModel) {
		var $this = this;
		$scope._id = $stateParams.id;
		$scope.update = GroupModel.update;

		$scope.data = {
			questionnaires: '',
			groupData: {}
		};

		QuestionnairesModel.getGroup($scope._id, function(data) {
			$scope.data.questionnaires = data;
		});

		GroupModel.load(function() {
			$scope.data.groupData = GroupModel.get($scope._id);
		});

	});
});