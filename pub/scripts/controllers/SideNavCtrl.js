angular.module('SideNav', ['CurrentState'])
	.controller('SideNavCtrl', function($scope, $state, $rootScope, $timeout, CurrentState) {
		var $this = this;
		$this.isCollapsed = {
			'service-provider': true,
			questionnaires: true,
			group: true,
			user: true,
			action: true,
			event: true,
			notification: true
		};

		this.isServiceProviderSelected = CurrentState.isServiceProviderSelected;

		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			$this.isCollapsed['service-provider'] = !(/service-provider/.test(toState.url));
			$this.isCollapsed.questionnaire = !(/questionnaire/.test(toState.url));
			$this.isCollapsed.group = !(/group/.test(toState.url));
			$this.isCollapsed.user = !(/user/.test(toState.url));
			$this.isCollapsed.action = !(/^\/action/.test(toState.url));
			$this.isCollapsed.event = !(/event/.test(toState.url));
			$this.isCollapsed.notification = !(/notification/.test(toState.url));
		});

		this.getParent = function(path) {
			return new RegExp('^' + path).test($state.current.url) ? 'active' : '';
		};
		this.getActive = function(path) {
			return $state.current.url == path ? 'active' : '';
		}
	});