define([
	'app',
	'/scripts/factories/QuestionnairesModel.js',
	'/scripts/factories/GroupModel.js',
], function(app) {
	app.register.factory('QuestionnaireRouter', function($state, $stateParams, $rootScope, $timeout, QuestionnairesModel, GroupModel) {
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
				function handleAdd() {
					if ($state.current.name == 'questionnaire/add/preview') {
						if (!QuestionnairesModel.loadTemp('add')) {
							$state.transitionTo('questionnaire/add/develop', {
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
							$state.transitionTo('questionnaire/add/develop', {
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

					if (QuestionnairesModel.loadTemp('add') && ($rootScope.previousId != 'add' || typeof $rootScope.previousId == 'undefined')) {
						var data = QuestionnairesModel.loadTemp('add');
						$scope.data.questions = data.questions;
						$scope.data.title = data.title;
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
						$scope.router.getGroups();
					}
				};

				function handleModify() {
					$scope.router.activeTab = ($state.current.name == 'questionnaire/preview') ? 'preview' : 'develop';
					$scope.id = $stateParams.id;
					if ($scope.router.activeTab == 'develop') {
						if ($stateParams.action) {
							$scope.router.activeDevelopTab = $stateParams.action;
						} else {
							$state.transitionTo('questionnaire/modify/develop', {
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

					if (!QuestionnairesModel.loadTemp($scope.id) || ($rootScope.previousId != $stateParams.id || typeof $rootScope.previousId == 'undefined')) {
						QuestionnairesModel.load(function() {
							$scope.router.fetchSavedData();
						});
					} else {
						var data = QuestionnairesModel.loadTemp($scope.id);
						$scope.data.questions = data.questions;
						$scope.data.title = data.title;
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

				// Handle add
				if (_.indexOf(['questionnaire/add', 'questionnaire/add/develop', 'questionnaire/add/preview'], $state.current.name) > -1) {
					handleAdd();
				}
				// Handle modify & preview
				else if (_.indexOf(['questionnaire/modify', 'questionnaire/modify/develop', 'questionnaire/preview'], $state.current.name) > -1) {
					handleModify();
				}
			};

			function changeView(view, action) {
				QuestionnairesModel.saveTemp('groups', $scope.groups);
				if (view == 'develop') {
					if ($scope.id) {
						QuestionnairesModel.saveTemp($scope.id, $scope.data);
						if (action) {
							$state.transitionTo('questionnaire/modify/develop', {
								id: $scope.id,
								action: action
							});
						} else {
							$state.transitionTo('questionnaire/modify', {
								id: $scope.id
							});
						}
					} else {
						QuestionnairesModel.saveTemp('add', $scope.data);
						if (action) {
							$state.transitionTo('questionnaire/add/develop', {
								id: 'add',
								action: action
							});
						} else {
							$state.transitionTo('questionnaire/add', {
								id: 'add'
							});
						}
					}

				} else if (view == 'preview') {
					if ($scope.data && $scope.inputQuestionnaire.$valid) {
						if ($scope.id) {
							QuestionnairesModel.saveTemp($scope.id, $scope.data);
							$state.transitionTo('questionnaire/preview', {
								id: $scope.id
							});
						} else {
							QuestionnairesModel.saveTemp('add', $scope.data);
							$state.transitionTo('questionnaire/add/preview', {
								id: 'add'
							});
						}
					}
				}
			};

			function fetchSavedData() {
				QuestionnairesModel.get($scope.id, function(data) {
					$scope.data.title = data.title;
					$scope.data.submitText = data.submitText;
					$scope.data.numberingStyle = data.numberingStyle;
					_.each(data.questions, function(a, b) {
						$scope.addQuestion(a, false);
					});
					$scope.router.getGroups(function(groups) {
						_.each(data.groups, function(group) {
							_.first(_.where(groups, {
								value: group
							})).selected = true;
						});
					});
					$('#QuestionnaireContainer .questions-pane').scrollTo(0);
				});
			};

			function getGroups($c) {
				$scope.groups = [];
				if (QuestionnairesModel.loadTemp('groups')) {
					$scope.groups = QuestionnairesModel.loadTemp('groups');
					_.each($scope.groups, function(group) {
						group.selected = false;
					})

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
							QuestionnairesModel.saveTemp('groups', $scope.groups);
							if ($c) {
								$c($scope.groups);
							}
						});
					}
				}
			};

			function setHeights() {
				$('#QuestionnaireContainer')
					.height($(window).height() - 150 + 'px')
					.css('overflow', 'hidden');
				$('#QuestionnaireContainer #develop #general-pane,#QuestionnaireContainer #develop #questions-pane').height(
					$('#QuestionnaireContainer').height() - 140 + 'px'
				);
				$('#QuestionnaireContainer #preview').height(
					$('#QuestionnaireContainer').height() - 70 + 'px'
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
		}
	});
});