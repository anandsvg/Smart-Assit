define([
	'app',
	'/scripts/factories/EventModel.js',
	'/scripts/factories/UserModel.js',
	'/scripts/factories/GroupModel.js',
], function(app) {
	app.register.factory('ActionRouter', function($state, $stateParams, $rootScope, $timeout, ActionModel, GroupModel, QuestionnairesModel, EventModel) {
		return function($scope) {

			// Initialize
			$scope.$watch('groups', function(n, o) {
				$scope.data.groups = [];
				_.each($scope.groups, function(b, a) {
					if (b.selected) {
						$scope.data.groups.push(b.value);
					}
				});
			}, true);

			function route() {
				var q = function() {
					$scope.questionnaires = QuestionnairesModel.get();
				},
					e = function() {
						$scope.events = EventModel.get();
					};
				if (!QuestionnairesModel.isLoaded()) {
					QuestionnairesModel.load(q);
				} else {
					q();
				}

				if (!EventModel.isLoaded()) {
					EventModel.load(e);
				} else {
					e();
				}

				// Handle add
				function handleAdd() {
					if ($state.current.name == 'action/add/preview') {
						if (!ActionModel.loadTemp('add')) {
							$state.transitionTo('action/add/develop', {
								action: 'general'
							}, {
								location: 'replace'
							});
						} else {
							$scope.router.activeTab = 'preview';
						}
					} else {
						$scope.router.activeTab = 'develop';
						if ($stateParams.action) {
							$scope.router.activeDevelopTab = $stateParams.action;
						} else {
							$state.transitionTo('action/add/develop', {
								action: 'general'
							}, {
								location: 'replace'
							});
						}
					}
					$scope.saveButton = 'Submit';
					$scope.action = "Add";
					$scope.submit = function() {
						$scope.add($scope.data);
					};

					if (ActionModel.loadTemp('add') && ($rootScope.previousId != 'add' || typeof $rootScope.previousId == 'undefined')) {
						var data = ActionModel.loadTemp('add');
						$scope.data.questions = data.questions;
						$scope.data.events = data.events;
						$scope.data.title = data.title;
						$scope.data.basedOn = data.basedOn;
						$scope.data.submitText = data.submitText;
						$scope.data.numberingStyle = data.numberingStyle;
						$scope.router.getGroups(function(groups) {
							_.each(data.groups, function(group) {
								_.first(_.where(groups, {
									value: group
								})).selected = true;
							});
						});
					} else {
						$scope.addQuestion(undefined, false);
						$scope.addEvent(undefined);
						$scope.router.getGroups();
					}
				};

				function handleModify() {
					$scope.router.activeTab = ($state.current.name == 'action/preview') ? 'preview' : 'develop';
					$scope.id = $stateParams.id;
					if ($scope.router.activeTab == 'develop') {
						if ($stateParams.action) {
							$scope.router.activeDevelopTab = $stateParams.action;
						} else {
							$state.transitionTo('action/modify/develop', {
								id: $scope.id,
								action: 'general'
							}, {
								location: 'replace'
							});
						}
					}

					$scope.saveButton = 'Save';
					$scope.action = "Modify";
					$scope.submit = function() {
						$scope.update($scope.id, $scope.data);
						$scope.saveButton = 'SAVED';
						$timeout(function() {
							$scope.saveButton = 'Save';
						}, 2000);
					};

					if (!ActionModel.loadTemp($scope.id) || ($rootScope.previousId != $stateParams.id || typeof $rootScope.previousId == 'undefined')) {
						ActionModel.load(function() {
							$scope.router.fetchSavedData();
						});
					} else {
						var data = ActionModel.loadTemp($scope.id);
						$scope.data.questions = data.questions;
						$scope.data.events = data.events;
						$scope.data.title = data.title;
						$scope.data.basedOn = data.basedOn;
						$scope.data.submitText = data.submitText;
						$scope.data.numberingStyle = data.numberingStyle;
						$scope.router.getGroups(function(groups) {
							_.each(data.groups, function(group) {
								_.first(_.where(groups, {
									value: group
								})).selected = true;
							});
						});
					}
				};

				if (_.indexOf(['action/add', 'action/add/develop', 'action/add/preview'], $state.current.name) > -1) {
					handleAdd();
				}
				// Handle modify & preview
				else if (_.indexOf(['action/modify', 'action/modify/develop', 'action/preview'], $state.current.name) > -1) {
					handleModify();
				}

				$scope.$watch('data.basedOn', function(n, o) {
					if (typeof n != 'undefined') {
						// Only do this if it is Add, or there was no questionnaire already
						if ($scope.action == 'Add') {
							if (n != '' && n != null) {
								QuestionnairesModel.get(n, function(questionnaire) {
									$scope.data.numberingStyle = questionnaire.numberingStyle;
									$scope.data.questions = [];
									_.each(questionnaire.questions, function(question) {
										question.fromQuestionnaire = questionnaire._id;
										question.useInputtedValue = true;
										if (question.type == 'list') {
											question.selectFromList = true;
										}

										$scope.addQuestion(new $scope.Question.question(question), false);
									});
								});
							} else {
								$scope.data.questions = [];
								$scope.addQuestion(undefined, false);
							}
						}
					}
				});
			};

			function changeView(view, action) {
				ActionModel.saveTemp('groups', $scope.groups);
				if (view == 'develop') {
					if ($scope.id) {
						ActionModel.saveTemp($scope.id, $scope.data);
						if (action) {
							$state.transitionTo('action/modify/develop', {
								id: $scope.id,
								action: action
							});
						} else {
							$state.transitionTo('action/modify', {
								id: $scope.id
							});
						}
					} else {
						ActionModel.saveTemp('add', $scope.data);
						if (action) {
							$state.transitionTo('action/add/develop', {
								id: 'add',
								action: action
							});
						} else {
							$state.transitionTo('action/add', {
								id: 'add'
							});
						}
					}

				} else if (view == 'preview') {
					if ($scope.data && $scope.inputAction.$valid) {
						if ($scope.id) {
							ActionModel.saveTemp($scope.id, $scope.data);
							$state.transitionTo('action/preview', {
								id: $scope.id
							});
						} else {
							ActionModel.saveTemp('add', $scope.data);
							$state.transitionTo('action/add/preview', {
								id: 'add'
							});
						}
					}
				}
			};

			function getGroups($c) {
				$scope.groups = [];
				if (ActionModel.loadTemp('groups')) {
					$scope.groups = ActionModel.loadTemp('groups');
					_.each($scope.groups, function(group) {
						group.selected = false;
					});

					if ($c) {
						$c($scope.groups);
					}
				} else {
					if (GroupModel.isLoaded()) {
						$scope.groups = [];
						var groups = GroupModel.get();
						_.each(groups, function(group) {
							$scope.groups.push({
								label: group.label,
								type: group.type,
								value: group._id,
								selected: false
							});
						});
						if ($c) {
							$c($scope.groups);
						}
					} else {
						GroupModel.load(function(groups) {
							_.each(groups, function(group) {
								$scope.groups.push({
									label: group.label,
									type: group.type,
									value: group._id,
									selected: false
								});
							});
							ActionModel.saveTemp('groups', $scope.groups);
							if ($c) {
								$c($scope.groups);
							}
						});
					}
				}
			};

			function fetchSavedData() {
				ActionModel.get($scope.id, function(data) {
					$scope.data.title = data.title;
					$scope.data.basedOn = data.basedOn;
					$scope.data.submitText = data.submitText;
					$scope.data.numberingStyle = data.numberingStyle;
					_.each(data.questions, function(a, b) {
						$scope.addQuestion(a, false);
					});
					_.each(data.events, function(a, b) {
						$scope.addEvent(a, false);
					});
					$scope.router.getGroups(function(groups) {
						_.each(data.groups, function(group) {
							_.first(_.where(groups, {
								value: group
							})).selected = true;
						});
					});
					$('#ActionContainer .questions-pane').scrollTo(0);
				});
			};

			function setHeights() {
				$('#ActionContainer')
					.height($(window).height() - 150 + 'px')
					.css('overflow', 'hidden');
				$('#ActionContainer #develop #general-pane,#ActionContainer #develop #questions-pane').height(
					$('#ActionContainer').height() - 140 + 'px'
				);
				$('#ActionContainer #preview').height(
					$('#ActionContainer').height() - 70 + 'px'
				);
			};

			function visual() {
				$(window).resize(function() {
					setHeights();
				});

				setHeights();
			};

			return {
				activeTab: 'develop',
				activeDevelopTab: 'general',
				route: route,
				changeView: changeView,
				fetchSavedData: fetchSavedData,
				getGroups: getGroups,
				setHeights: setHeights,
				visual: visual
			};

		};
	});
});