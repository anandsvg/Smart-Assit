define([
	'app',
	'/scripts/factories/Uuid.js',
	'/scripts/factories/EventModel.js',
	'/scripts/factories/GroupModel.js',
	'/scripts/factories/Items.js',
	'/scripts/directives/CollectionDir.js',
	'ckeditor'
], function(app) {
	app.register.controller('EventCtrl', function(EventModel, GroupModel, UUID, $scope, $rootScope, $state, $stateParams, $timeout, $sce, Items, $modal) {
		$scope.implementOptions = [{
			value: 'submission',
			label: 'Submission'
		}, {
			value: 'assistance',
			label: 'Assistance'
		}];

		$scope.changeView = function(view, spec) {
			var specific = spec || 'add';
			$state.transitionTo('event/modify/specific', {
				id: $scope.id,
				type: view,
				specific: specific
			});
		};

		$scope.getGroups = function($c) {
			$scope.groups = [];
			if (GroupModel.isLoaded()) {
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
					if ($c) {
						$c($scope.groups);
					}
				});
			}
		};

		$scope.addNew = function(newId, newItem, id) {
			if ($scope.id == id) { // Is Event
				$scope.eventData.items.push(newItem);
				$scope.updateEventData();
			} else {
				var found = Items.findItem($scope.eventData, {
					id: id
				});
				if (found) {
					found[0].items[found[1]].items.push(newItem);
					$scope.updateEventData();
				}
			}
		};

		$scope.addNewNotification = function(id) {
			var newId = UUID(),
				newItem = {
					id: newId,
					name: 'New Notification #' + Math.round(Math.random() * 1000),
					type: 'notification-alert',
					openImmediately: 'false',
					userAsTitle: 'false',
					items: [],
					groups: [],
					recipients: [],
					exceptions: [],
					map: 'false'
				};
			$scope.addNew(newId, newItem, id);
		};

		$scope.addNewAction = function(id) {
			var newId = UUID(),
				l = $scope.notificationData.items.length,
				newItem = {
					id: newId,
					name: 'New Action #' + Math.round(Math.random() * 1000),
					type: 'action',
					items: [],
					order: l,
					invokationTimes: 'single',
					disables: []
				};
			$scope.addNew(newId, newItem, id);
		};

		$scope.addExisting = function(id, copyId, type) {
			var newId = UUID(),
				l = (type == 'notification') ? $scope.notificationData.items.length : $scope.actionData.items.length,
				found = Items.findItem($scope.eventData, {
					id: copyId
				});
			var newItem = angular.copy(found[0].items[found[1]]);
			newItem.id = newId;
			newItem.order = l;

			// Go through all items and assign new id
			function updateItemsIds(it) {
				console.log(it);
				it.name += ' #' + Math.round(Math.random() * 1000);
				it.id = UUID();

				_.each(it.items, function(v, k) {
					it.items[k] = updateItemsIds(v);
				});
				return it;
			};

			newItem = updateItemsIds(newItem);

			if ($scope.id == id) {
				$scope.eventData.items.push(newItem);
				$scope.updateEventData();
			} else {
				var found = Items.findItem($scope.eventData, {
					id: id
				});
				if (found) {
					found[0].items[found[1]].items.push(newItem);
				}
			}
			afterEventLoad();
		};

		$scope.linkExisting = function(id, copyId, type) {
			var newId = UUID(),
				l = (type == 'notification') ? $scope.notificationData.items.length : $scope.actionData.items.length,
				newItem = {
					id: newId,
					copyId: copyId,
					order: l
				}
			if ($scope.id == id) {
				$scope.eventData.items.push(newItem);
				$scope.updateEventData();
			} else {
				var found = Items.findItem($scope.eventData, {
					id: id
				});
				if (found) {
					found[0].items[found[1]].items.push(newItem);
					$scope.updateEventData();
				}
			}
			afterEventLoad();
		};

		$scope.findParentActions = function(id) {
			var actions = [],
				fid = id,
				parent = false,
				found = true;
			while (found != false) {
				found = Items.findParent(fid);
				if (found[0]) {
					parent = found[0];
				} else if (found._id) {
					parent = found;
				} else {
					parent = false;
				}

				if (parent) {
					if (parent._id) {
						actions.push({
							value: parent._id,
							label: parent.name + ' User',
							selected: false
						});
					} else if (parent.type == 'action') {
						actions.push({
							value: parent.id,
							label: parent.name + ' User',
							selected: false
						});
					}

					if (parent._id) {
						found = false;
					} else {
						fid = parent.id;
					}
				}
			}

			return actions.reverse();
		};

		$scope.removeConfirmation = function(id, back) {
			if (confirm('Are you sure you want to remove this?')) {
				if ($scope.specificId != id) {
					var parentId = $scope.specificId;
				} else {
					var f = Items.findParent(id),
						parentId = f[0].id;
				}
				if (back) {
					var backData = Items.getItem(parentId);
				}
				if (Items.removeItem(parentId, id)) {
					$scope.updateEventData();
					if (back) {
						$scope.returnAfterRemove(backData);
					}
				}
			}
		};

		$scope.returnAfterRemove = function(parent) {
			if (parent.type == 'event') {
				$state.transitionTo('event/modify', {
					id: $scope.id
				});
			} else {
				$state.transitionTo('event/modify/specific', {
					id: $scope.id,
					type: parent.type,
					specific: parent.id
				});
			}
		};

		$scope.updateEventData = function() {
			EventModel.update($scope.id, $scope.eventData);
			Items.setItems($scope.eventData);
		};

		$scope.trustHTML = function(html) {
			return $sce.trustAsHtml(html);
		};

		if (_.indexOf(['event/modify', 'event/modify/specific'], $state.current.name) > -1) {
			$scope.id = $stateParams.id;

			function afterEventLoad() {
				// Notification
				if (/notification/.test($stateParams.type)) {
					$scope.$watch('notificationData.type', function(n, o) {
						if (n == 'notification-alert') {
							$scope.notificationData.items = [];
						}
					});
					$scope.view = 'notification';
					$scope.actionTitle = 'Notification';
					$scope.saveButton = 'Save';
					$scope.specificId = $stateParams.specific;
					$scope.currentId = $scope.specificId;

					$scope.notificationData = Items.getItem($scope.specificId);

					// COPIED ACTIONS
					_.each(_.filter($scope.notificationData.items, function(item) {
						return (item.copyId);
					}), function(copied) {
						var item = _.first(_.where($scope.notificationData.items, {
							copyId: copied.copyId
						}));
						var citem = Items.getItem(copied.copyId);
						$scope['watch' + copied.id] = citem;
						$scope.$watch('watch' + copied.id + '.name', function(n, o) {
							copied.name = n;
						});
						copied.copy = true;
						copied.order = item.order;
					});

					// RECIPIENTS
					$scope.possibleRecipients = [];

					// Get Parent Actions
					var parentActions = $scope.findParentActions($scope.currentId);
					_.each(parentActions, function(action) {
						$scope.possibleRecipients.push(action);
					});
					// EXCEPTIONS
					$scope.possibleExceptions = angular.copy($scope.possibleRecipients);

					_.each($scope.notificationData.recipients, function(recipient) {
						_.each($scope.possibleRecipients, function(b, a) {
							if (b.value == recipient) {
								b.selected = true;
							}
						});
					});

					$scope.$watch('possibleRecipients', function(n, o) {
						_.each($scope.possibleRecipients, function(b, a) {
							if (b.selected) {
								if (_.indexOf($scope.notificationData.recipients, b.value) == -1) {
									$scope.notificationData.recipients.push(b.value);
								}
							} else {
								$scope.notificationData.recipients = _.without(
									$scope.notificationData.recipients,
									b.value
								);
							}
						});
					}, true);

					// GROUPS
					$scope.getGroups(function(groups) {
						_.each($scope.notificationData.groups, function(group) {
							_.first(_.where(groups, {
								value: group
							})).selected = true;
						});
						$scope.$watch('groups', function(n, o) {
							$scope.notificationData.groups = [];
							_.each($scope.groups, function(b, a) {
								if (b.selected) {
									if (_.indexOf($scope.notificationData.groups, b.value) == -1) {
										$scope.notificationData.groups.push(b.value);
									}
								} else {
									$scope.notificationData.groups = _.without($scope.notificationData.groups, b.value);
								}
							});
						}, true);
					});

					// EXCEPTIONS				
					_.each($scope.notificationData.exceptions, function(recipient) {
						_.each($scope.possibleExceptions, function(b, a) {
							if (b.value == recipient) {
								b.selected = true;
							}
						});
					});

					$scope.$watch('possibleExceptions', function(n, o) {
						_.each($scope.possibleExceptions, function(b, a) {
							if (b.selected) {
								if (_.indexOf($scope.notificationData.exceptions, b.value) == -1) {
									$scope.notificationData.exceptions.push(b.value);
								}
							} else {
								$scope.notificationData.exceptions = _.without($scope.notificationData.exceptions, b.value);
							}
						});
					}, true);

					$scope.recipientSelected = function() {
						return ($scope.notificationData.recipients.length > 0 || $scope.notificationData.groups.length > 0);
					};

					// EXISTING ACTIONS
					$scope.existingActions = [];

					function findActions(item) {
						if (item.type == 'action' && !item.copyId) {
							$scope.existingActions.push({
								id: item.id,
								name: item.name
							});
						}
						if (item.items && item.items.length > 0) {
							_.each(item.items, function(a) {
								findActions(a);
							});
						}
					};

					$scope.$watch('eventItems', function(n, o) {
						$scope.existingActions = [];
						_.each($scope.eventItems, function(item) {
							findActions(item);
						});
					}, true);

					$scope.move = function(id, direction) {
						var items = $scope.notificationData.items,
							current = _.first(_.where(items, {
								id: id
							})),
							currentPosition = current.order,
							requestedPosition = (direction == 'up') ? currentPosition - 1 : currentPosition + 1,
							requested = _.first(_.where(items, {
								order: requestedPosition
							}));

						if (requested) {
							current.order = requestedPosition;
							requested.order = currentPosition;
						}
					};

					$scope.submit = function() {
						$scope.updateEventData();
						$scope.saveButton = 'SAVED';
						$timeout(function() {
							$scope.saveButton = 'Save';
						}, 2000);
					};

					// setTimeout(function() {
					// 	CKEDITOR.replace('message');
					// }, 1000);

					// Action
				} else if ($stateParams.type == 'action') {
					$scope.view = 'action';
					$scope.actionTitle = 'Event Action';
					$scope.saveButton = 'Save';
					$scope.specificId = $stateParams.specific;
					$scope.currentId = $scope.specificId;

					$scope.actionData = Items.getItem($scope.specificId);

					$scope.showColors = function() {
						var modal = $modal.open({
							templateUrl: 'colors',
							controller: function($scope) {
								$scope.hideColors = function() {
									modal.dismiss('cancel');
								};
							}
						});
					};

					// COPIES NOTIFICATIONS
					_.each(_.filter($scope.actionData.items, function(item) {
						return (item.copyId);
					}), function(copied) {
						var citem = Items.getItem(copied.copyId);
						$scope['watch' + copied.id] = citem;
						$scope.$watch('watch' + copied.id + '.name', function(n, o) {
							copied.name = n;
						});
						copied.copy = true;
						copied.order = item.order;
					});

					// EXISTING NOTIFICATIONS
					$scope.existingNotifications = [];

					function findNotifications(item) {
						if (/notification/.test(item.type) && !item.copyId) {
							$scope.existingNotifications.push({
								id: item.id,
								name: item.name
							});
						}
						if (item.items && item.items.length > 0) {
							_.each(item.items, function(a) {
								findNotifications(a);
							});
						}
					};

					_.each($scope.eventItems, function(item) {
						findNotifications(item);
					});

					// DISABLES ACTIONS

					$scope.possibleActions = Items.getActions();
					$scope.$watch('possibleActions', function() {
						$scope.possibleDeleteActions = [];

						_.each($scope.possibleActions, function(a) {
							var action = a[0].items[a[1]],
								title = a[0].name + ' > ' + action.name;
							$scope.possibleDeleteActions.push({
								id: action.id,
								name: title,
								notification: a[0].name,
								selected: _.indexOf($scope.actionData.disables, action.id) > -1
							});
						});
					}, true);

					$scope.$watch('possibleDeleteActions', function(n, o) {
						_.each($scope.possibleDeleteActions, function(b, a) {
							if (b.selected) {
								if (_.indexOf($scope.actionData.disables, b.id) == -1) {
									$scope.actionData.disables.push(b.id);
								}
							} else {
								$scope.actionData.disables = _.without(
									$scope.actionData.disables,
									b.id
								);
							}
						});
					}, true);

					$scope.submit = function() {
						$scope.updateEventData();
						$scope.saveButton = 'SAVED';
						$timeout(function() {
							$scope.saveButton = 'Save';
						}, 2000);
					};
					// Event
				} else {
					$scope.view = 'event';
					$scope.actionTitle = 'Event';
					$scope.actionButton = 'Save';
					$scope.currentId = $scope.id;
					$scope.submit = function() {
						$scope.updateEventData();
						$scope.actionButton = 'SAVED';
						$timeout(function() {
							$scope.actionButton = 'Save';
						}, 2000);
					};
				}
			};

			// Load
			if (!EventModel.loadTemp($scope.id) || ($scope.previousId != $stateParams.id || typeof $scope.previousId == 'undefined')) {
				EventModel.get($scope.id, function(data) {
					EventModel.saveTemp($scope.id, data);
					$scope.eventData = data;
					Items.setItems($scope.eventData);
					$scope.eventItems = [$scope.eventData];
					afterEventLoad();
				});
			} else {
				var data = EventModel.loadTemp($scope.id);
				$scope.eventData = data;
				$scope.eventItems = [{
					name: $scope.eventData.name,
					id: $scope.id,
					type: 'event',
					items: $scope.eventData.items
				}];
				afterEventLoad();
			}

		} else {
			$scope.eventData = {
				status: 'Request Received',
				statusCode: 0
			};
			$scope.view = 'event';
			$scope.actionTitle = 'Add Event';
			$scope.actionButton = 'Submit';
			$scope.currentId = 'add';
			$scope.submit = function() {
				EventModel.add($scope.eventData);
			};
		}
	});

	app.register.directive('ckEditor', function() {
		return {
			require: '?ngModel',
			link: function(scope, elm, attr, ngModel) {
				console.log('ckeditor');
				var ck = CKEDITOR.replace(elm[0]);

				if (!ngModel) return;

				ck.on('instanceReady', function() {
					ck.setData(ngModel.$viewValue);
				});

				function updateModel() {
					scope.$apply(function() {
						ngModel.$setViewValue(ck.getData());
					});
				}

				ck.on('change', updateModel);
				ck.on('key', updateModel);
				ck.on('dataReady', updateModel);

				ngModel.$render = function(value) {
					ck.setData(ngModel.$viewValue);
				};
			}
		};
	});
});