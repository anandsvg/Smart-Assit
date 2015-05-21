define([
	'app',
	'factories/CurrentState',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/factories/ActionModel.js',
	'/scripts/directives/SmartDir.js'
], function(app) {
	app.register.controller('QuestionnairePreviewCtrl', function(QuestionnairesModel, CurrentState, ActionModel, $stateParams, $scope, $timeout, $interval, $http) {
		var $this = this;
		$scope.setInputted = function(question) {
			if (question.type == 'list') {
				return _.pluck(_.filter(question.value, function(list) {
					return (list.value.length > 0)
				}), 'value');
			} else if (question.type == 'checkbox') {
				return _.pluck(_.where(question.options, {
					selected: true
				}), 'value');
			} else {
				return question.value || '';
			}
		};

		$scope.reset = function() {
			console.log('reset');
			$scope.data.inputted = {};
			_.each($scope.$parent.data.questions, function(a, b) {
				if ($scope.data.questions[b].type == 'list') {
					$scope.data.questions[b].value = [];

				} else {
					$scope.data.questions[b].value = '';
				}
			});
		};

		$scope.submit = function() {
			var data = $scope.data.inputted;

			if ($scope.id) {
				data['user'] = CurrentState.get('user');
				data['serviceProvider'] = CurrentState.get('serviceProvider');
				data['questionnaire'] = $scope.id;

				$http.post('/api/questionnaire/input', data)
					.success(function(res) {
						ActionModel.deleteTemp(data['user']);
					});
			} else {

			}
		};

		var s = new Date()
		h = $interval(function() {
			if ($scope.$parent.data.questions.length > 0 || new Date() - s > 10000) {
				_.each($scope.$parent.data.questions, function(question, index) {
					$scope.data.inputted[question.name] = $scope.setInputted(question);

					$scope.$watch('$parent.data.questions[' + index + ']', function(n, o) {
						$scope.data.inputted[n.name] = $scope.setInputted(n);
					}, true);
				});
				$interval.cancel(h);
			}
		}, 50);
	})
});