define([
	'app'
], function(app) {
	app.register.directive('inputtedDefault', function($timeout) {
		return {
			restrict: 'A',
			priority: 0,
			link: function(scope, elm, attrs) {

				function calc() {
					var $elm = $(elm);
					switch ($elm.attr('type')) {
						case 'radio':
							if ($elm.prop('checked')) {
								$elm.triggerHandler('click');
							}
							break;
						case 'checkbox':
							if ($elm.prop('checked')) {
								$elm.triggerHandler('click');
							}
							break;
					}
				};
				$timeout(calc, 0);
			}
		}
	})
	app.register.directive('inputList', function($interval) {
		return {
			restrict: 'E',
			replace: true,
			require: 'ngModel',
			link: function(scope, elm, attrs, model) {
				scope.$parent.ques.value = [{
					value: ''
				}];

				scope.$watch('data.inputted["' + scope.ques.name + '"]', function() {
					var q = scope.data.inputted[scope.ques.name],
						valid = false;
					_.each(q, function(z, x) {
						if (z.length > 0) {
							valid = true;
						}
					});
					if (scope.ques.required) {
						model.$setValidity('listRequired', valid);
					}
					model.$setPristine(false);
				});
			}
		};
	})

});