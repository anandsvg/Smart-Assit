define([
	'app',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/factories/GroupModel.js'
], function(app, QuestionnairesModel) {
	app.register.controller('QuestionnaireListCtrl', function($scope, QuestionnairesModel, GroupModel) {
		var $this = this;
		$scope.questionnaires = {};
		$scope.questionnaireGroups = {};

		var h = function(data) {
			$scope.questionnaires = data;
			var i = function() {
				_.each($scope.questionnaires, function(questionnaire, index) {
					$scope.questionnaireGroups[questionnaire._id] = [];
					_.each(questionnaire.groups, function(group) {
						$scope.questionnaireGroups[questionnaire._id].push(GroupModel.getLabel(group));
					});
				});
			};
			if (!GroupModel.isLoaded()) {
				GroupModel.load(i);
			} else {
				i(GroupModel.get());
			}
		};

		if (!QuestionnairesModel.isLoaded()) {
			QuestionnairesModel.load(h);
		} else {
			h(QuestionnairesModel.get());
		}

		this.remove = function(_id) {
			QuestionnairesModel.remove(_id);
		};
	});
});