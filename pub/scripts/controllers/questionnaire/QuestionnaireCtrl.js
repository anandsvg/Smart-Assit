define([
	'app',
	'/scripts/factories/Question.js',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/factories/QuestionnaireRouter.js',
	'/scripts/controllers/questionnaire/QuestionnairePreviewCtrl.js'
], function(app) {
	app.register.controller('QuestionnaireCtrl', function($scope, $interval, $timeout, Question, QuestionnairesModel, QuestionnaireRouter) {
		var $this = this;
		var Question = Question($this, $scope);
		var Router = $scope.router = QuestionnaireRouter($scope);

		$scope.add = QuestionnairesModel.add;
		$scope.update = QuestionnairesModel.update;

		window.scope = $scope;

		$scope.data = {
			questions: [],
			inputted: {},
			submitText: 'Submit',
			groups: [],
			numberingStyle: 'none'
		};

		$this.move = function(items, type, d, c) {
			var $this = this;
			if (d == 'up') {
				// There is room to move up
				if (c > 0) {
					_.each(items, function(value, index) {
						if (value.order == c - 1) // Update new loc to old val
						{
							items[index].order = c;
						} else if (value.order == c) // Update old loc to new val
						{
							items[index].order = c - 1;
						}
					});
				}
			} else {
				if (c < items.length) {
					_.each(items, function(value, index) {
						if (value.order == c + 1) // Update new loc to old val
						{
							items[index].order = c;
						} else if (value.order == c) // Update old loc to new val
						{
							items[index].order = c + 1;
						}
					});
				}
			}

			$timeout(function() {
				if (type == 'question') {
					$scope.data.questions = items;
					$scope.updateIndicies();
				} else if (type == 'option') {
					$this.options = items;
				}
				$scope.$apply();
			}, 0);
		};

		$scope.addQuestion = function(q, scroll) {
			var c = $scope.data.questions.length,
				n = c + 1;
			if (typeof q != 'undefined') {
				var question = q;
			} else {
				var question = Question.defaultQuestion(c, n);
			}

			$scope.data.questions.push(new Question.question(question));
			$scope.updateIndicies();

			if (typeof scroll == 'undefined' || scroll) {
				$timeout(function() {
					Router.changeView('develop', 'questions');
					$('#QuestionnaireContainer #questions-pane').scrollTo(
						$('#QuestionnaireContainer #questions-pane').prop('scrollHeight')
					);
				}, 500);
			}
		};

		$this.collapseQuestions = function() {
			Router.activeDevelopTab = 'questions';
			_.each($scope.data.questions, function(question, index) {
				question.isCollapsed = true;
			});
		};

		$this.expandQuestions = function() {
			Router.activeDevelopTab = 'questions';
			_.each($scope.data.questions, function(question, index) {
				question.isCollapsed = false;
			});
		};

		$scope.updateIndicies = function() {
			_.each($scope.data.questions, function(a, b) {
				$scope.data.questions[b].index = b;
			});
		};

		$this.reset = function() {
			// Modify
			if ($scope.id) {
				Router.fetchSavedData();
			} else {
				$scope.data.questions = [];
				$scope.data.submitText = 'Submit';
				$scope.data.numberingStyle = 'none';
				Router.getGroups();
				$scope.addQuestion(Question.defaultQuestion(0, 1));
			}
		};

		// ROUTING		
		Router.route();

		// VISUAL RELATED
		Router.visual();
	});
});