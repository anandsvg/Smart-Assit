define([
	'app',
	'factories/CurrentState',
	'/scripts/factories/ActionModel.js',
	'/scripts/directives/SmartDir.js',
], function(app) {
	app.register.controller('ActionPreviewCtrl', function($scope, $http, $timeout, $interval, ActionModel, CurrentState) {
		var $this = this;
		window.view = $scope;
		$scope.setInputted = function(question) {
			if (question.type == 'list' && !question.selectFromList) {
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
			alert('Submit!');
		};

		function loadUserAnswers() {
			if ($scope.data.basedOn) {
				var uid = CurrentState.get('user');
				$http.get('/api/questionnaire/' + $scope.data.basedOn)
					.success(function(data) {
						loadAnswers(data);
					});
			}
		};

		function loadAnswers(questionnaireData) {
			_.each($scope.data.questions, function(v, k) {
				if (v.fromQuestionnaire == $scope.data.basedOn && v.useInputtedValue) {
					if (v.type == 'list') {
						if (v.selectFromList) {
							v.options = [];
							_.each(questionnaireData[v.name], function(a, b) {
								v.options.push({
									value: a,
									label: a,
									selected: false
								});
							});
						} else {
							v.value = [];
							_.each(questionnaireData[v.name], function(a, b) {
								v.value.push({
									value: a
								});
							});
						}
					} else {
						v.value = questionnaireData[v.name];
					}
				}
			});
		};

		var s = new Date();
		h = $interval(function() {
			if ($scope.$parent.data.questions.length > 0 || new Date() - s > 10000) {
				$interval.cancel(h);

				_.each($scope.$parent.data.questions, function(question, index) {
					$scope.data.inputted[question.name] = $scope.setInputted(question);

					$scope.$watch('$parent.data.questions[' + index + ']', function(n, o) {
						if (n) {
							$scope.data.inputted[n.name] = $scope.setInputted(n);
						}
					}, true);
				});

				loadUserAnswers();
			}
		}, 50);
	});
});