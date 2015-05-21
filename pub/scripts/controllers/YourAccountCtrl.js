define([
	'app',
], function(app) {
	app.register.controller('YourAccountCtrl', function($scope, $http, $state, $timeout, CurrentState) {
		$scope.myTitle = 'Your Account';

		$scope.data = {
			email: CurrentState.get('email'),
			firstName: CurrentState.get('firstName'),
			lastName: CurrentState.get('lastName')
		};

		var defaultServiceProvider = CurrentState.get('defaultServiceProvider');
		$scope.serviceProviders = [{
			_id: '',
			company: 'No Default Service Provider',
			selected: false
		}];

		CurrentState.getServiceProviders(function(data) {
			var sps = data;
			_.each(sps, function(sp, _id) {
				$scope.serviceProviders.push({
					_id: _id,
					company: sp.company,
					selected: false
				});
			});

			_.each($scope.serviceProviders, function(sp, k) {
				$scope.serviceProviders[k].selected = (defaultServiceProvider == sp._id);
			});

			if (_.where($scope.serviceProviders, {
				selected: true
			}).length == 0) {
				_.first(_.where($scope.serviceProviders, {
					_id: ''
				})).selected = true;
				$scope.data.defaultServiceProvider = '';
			} else {
				$scope.data.defaultServiceProvider = defaultServiceProvider;
			}
		});

		$scope.actionButton = 'Save';

		$scope.submit = function() {
			console.log('submit! ' + $scope.data.defaultServiceProvider);
			CurrentState.set('defaultServiceProvider', $scope.data.defaultServiceProvider);
			var data = angular.copy($scope.data);
			if (data.defaultServiceProvider.length == 0) {
				data.defaultServiceProvider = 'none';
			}
			delete data.passwordConfirmation;
			$http.put('/account/your-account', data)
				.success(function(ret) {
					console.log(ret);
					if (ret.email.status == 0) {
						alert('That email address is unavailable!');
						$scope.data.email = CurrentState.get('email');
					}

					$scope.actionButton = 'SAVED';
					$timeout(function() {
						$scope.actionButton = 'Save';
					}, 2500);
				});
		};
	});
	app.register.directive('blurFocus', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, elm, attr, ctrl) {
				if (!ctrl) {
					return;
				}

				elm.on('focus', function() {
					elm.addClass('has-focus');
					scope.$apply(function() {
						ctrl.hasFocus = true;
					});
				});

				elm.on('blur', function() {
					elm.removeClass('has-focus');
					elm.addClass('has-visited');

					scope.$apply(function() {
						ctrl.hasFocus = false;
						ctrl.hasVisited = true;
					});
				});

				elm.closest('form').on('submit', function() {
					elm.addClass('has-visited');

					scope.$apply(function() {
						ctrl.hasFocus = false;
						ctrl.hasVisited = true;
					});
				});

			}
		};
	});
	app.register.directive('same', function() {
		return {
			restrict: 'A',
			scope: true,
			require: 'ngModel',
			link: function(scope, $element, $attrs, $model) {
				scope.$watch('data', function() {
					var valid = (scope.data.password === scope.data.passwordConfirmation);
					$model.$setValidity('same', valid);
				}, true);
			}
		};
	});
});