define([
	'app',
], function(app) {
	app.register.directive('collection', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				id: '=',
				collection: '=',
				copyId: '='
			},
			//templateUrl: '/views/collection-template'
			template: "<ul class=\"nav nav-stacked nav-pills\"><member ng-repeat='member in collection' member='member' id='id' copyId='copyId'></member></ul>"
		}
	});

	app.register.directive('member', function($compile, $stateParams, Items) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				id: '=',
				member: '=',
				copyId: '='
			},
			templateUrl: '/views/member-template',
			link: function(scope, element, attrs) {
				if (scope.member) {
					var p = Items.findParent(scope.member.id);

					if (p[0]) {
						scope.parent = p[0].id;
					}

					scope.currentSpecific = $stateParams.specific;

					if (angular.isArray(scope.member.items)) {
						$compile("<collection collection='member.items' id='id' copyId='copyId'></collection>")(scope, function(cloned, scope) {
							element.append(cloned);
						});
					} else if (scope.member.copyId) {
						scope.member.copy = true;
						scope['watches' + scope.member.copyId] = Items.getItem(scope.member.copyId);
						scope.$watch('watches' + scope.member.copyId + '.name', function(n, o) {
							scope.member.name = n;
						});
						scope.$watch('watches' + scope.member.copyId + '.type', function(n, o) {
							scope.member.type = n;
						});
					}
				}
			}
		}
	});
});