define([
	'app',
	'/scripts/factories/Question.js',
	'/scripts/factories/ActionModel.js',
	'/scripts/factories/ActionRouter.js',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/controllers/action/ActionPreviewCtrl.js'
], function(app) {
	app.register.controller('ActionCtrl', function($scope, $interval, $timeout, Question, ActionModel, ActionRouter, QuestionnairesModel, EventModel) {
		var $this = this;
		var Question = Question($this, $scope);
		$scope.Question = Question;
		var Router = $scope.router = ActionRouter($scope);

		$scope.add = ActionModel.add;
		$scope.update = ActionModel.update;

		$scope.questionnaires = {};
		$scope.events = {};

		$scope.data = {
			questions: [],
			events: [],
			inputted: {},
			submitText: 'Submit',
			numberingStyle: 'none'
		};
		window.scope = $scope;

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
					$this.updateIndicies();
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
					$('#ActionContainer #questions-pane').scrollTo(
						$('#ActionContainer #questions-pane').prop('scrollHeight')
					);
				}, 500);
			}
		};

		$this.collapseQuestions = function() {
			$this.activeDevelopTab = 'questions';
			_.each($scope.data.questions, function(question, index) {
				question.isCollapsed = true;
			});
		};

		$this.expandQuestions = function() {
			$this.activeDevelopTab = 'questions';
			_.each($scope.data.questions, function(question, index) {
				question.isCollapsed = false;
			});
		};

		$scope.updateIndicies = function() {
			_.each($scope.data.questions, function(a, b) {
				$scope.data.questions[b].index = b;
			});
		};

		$this.defaultEvent = function(c, n) {
			return {
				isCollapsed: false,
				advancedIsCollapsed: true,
				index: c,
				order: c,
				name: 'event' + n,
				label: 'Event ' + n,
				type: 'notification',
				conditions: []
			};
		};

		var Event = function(q) {
			var $t = this;
			_.each(q, function(a, b) {
				$t[b] = a;
			});
		};

		Event.prototype.remove = function() {
			$scope.data.events.splice(this.index, 1);
		};

		$scope.addEvent = function(e) {
			var c = $scope.data.events.length,
				n = c + 1;
			if (typeof e != 'undefined') {
				var event = e;
			} else {
				var event = $this.defaultEvent(c, n);
			}

			$scope.data.events.push(new Event(event))
		};

		$this.reset = function() {
			// Modify
			if ($scope.id) {
				$scope.data.inputted = {};
				$scope.data.questions = [];
				$this.fetchSavedData();
			} else {
				$scope.data.inputted = {};
				$scope.data.questions = [];
				$scope.data.submitText = 'Submit';
				$scope.data.numberingStyle = 'none';
				Router.getGroups();
				$scope.addQuestion(Question.defaultQuestion(0, 1));
				$this.addEvent($this.defaultEvent(0, 1));
			}
		};

		// ROUTING
		Router.route();

		// VISUAL RELATED
		Router.visual();
	});
});