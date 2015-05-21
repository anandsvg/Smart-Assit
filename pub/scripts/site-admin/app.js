define([
	'angularAMD',
	'jquery',
	'ui-router',
	'ui-bootstrap',
	'underscore',
	'controllers/TopNavCtrl',
	'controllers/SideNavCtrl',
	'directives/FocusDir',
	'niceScroll',
	'scrollTo',
	'respond',
	'common-scripts'
], function(angularAMD) {
	'use strict';

	var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'TopNav', 'SideNav', 'Focus']);

	app.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/service-provider');

		$stateProvider
		// USER
		.state(
			'logout',
			angularAMD.route({
				onEnter: function($http) {
					$http.get('/account/logout')
						.success(function(err, res) {
							window.location = '/';
						});
				}
			})
		)
		// SERVICE PROVIDER
		.state(
			'service-provider',
			angularAMD.route({
				url: '/service-provider',
				templateUrl: '/views/service-provider-list',
				controllerUrl: '/scripts/controllers/service-provider/ServiceProviderListCtrl.js',
			})
		)
			.state(
				'service-provider/add',
				angularAMD.route({
					url: '/service-provider/add',
					templateUrl: '/views/service-provider-add',
					controllerUrl: '/scripts/controllers/service-provider/ServiceProviderAddCtrl.js',
				})
		)
			.state(
				'service-provider/modify',
				angularAMD.route({
					url: '/service-provider/:id/modify',
					templateUrl: '/views/service-provider-modify',
					controllerUrl: '/scripts/controllers/service-provider/ServiceProviderModifyCtrl.js',
				})
		)
			.state(
				'your-account',
				angularAMD.route({
					url: '/your-account',
					templateUrl: '/views/your-account',
					controllerUrl: '/scripts/controllers/YourAccountCtrl.js'
				})
		)
		// USER
		.state(
			'user',
			angularAMD.route({
				url: '/user',
				templateUrl: '/views/user-list',
				controllerUrl: '/scripts/controllers/user/UserListCtrl.js',
			})
		)
			.state(
				'user/add',
				angularAMD.route({
					url: '/user/add',
					templateUrl: '/views/user-add',
					controllerUrl: '/scripts/controllers/user/UserAddCtrl.js',
				})
		)
			.state(
				'user/modify',
				angularAMD.route({
					url: '/user/:id/modify',
					templateUrl: '/views/user-modify',
					controllerUrl: '/scripts/controllers/user/UserModifyCtrl.js',
				})
		)
		// GROUPS
		.state(
			'group',
			angularAMD.route({
				url: '/group',
				templateUrl: '/views/group-list',
				controllerUrl: '/scripts/controllers/group/GroupListCtrl.js',
			})
		)
			.state(
				'group/add',
				angularAMD.route({
					url: '/group/add',
					templateUrl: '/views/group-add',
					controllerUrl: '/scripts/controllers/group/GroupAddCtrl.js',
				})
		)
			.state(
				'group/modify',
				angularAMD.route({
					url: '/group/:id/modify',
					templateUrl: '/views/group-modify',
					controllerUrl: '/scripts/controllers/group/GroupModifyCtrl.js',
				})
		)
		// QUESTIONNAIRES
		.state(
			'questionnaire',
			angularAMD.route({
				url: '/questionnaire',
				templateUrl: '/views/questionnaire-list',
				controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireListCtrl.js'
			})
		)
			.state(
				'questionnaire/add',
				angularAMD.route({
					url: '/questionnaire/add',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js'
				})
		)
			.state(
				'questionnaire/add/preview',
				angularAMD.route({
					url: '/questionnaire/add/preview',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js',
				})
		)
			.state(
				'questionnaire/add/develop',
				angularAMD.route({
					url: '/questionnaire/add/:action',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js'
				})
		)
			.state(
				'questionnaire/modify',
				angularAMD.route({
					url: '/questionnaire/{id:[a-zA-Z0-9]{24,}}',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js',
				})
		)
			.state(
				'questionnaire/preview',
				angularAMD.route({
					url: '/questionnaire/{id:[a-zA-Z0-9]{24,}}/preview',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js',
				})
		)
			.state(
				'questionnaire/modify/develop',
				angularAMD.route({
					url: '/questionnaire/{id:[a-zA-Z0-9]{24,}}/:action',
					templateUrl: '/views/questionnaire-input',
					controllerUrl: '/scripts/controllers/questionnaire/QuestionnaireCtrl.js',
				})
		)
		// ACTION
		.state(
			'action',
			angularAMD.route({
				url: '/action',
				templateUrl: '/views/action-list',
				controllerUrl: '/scripts/controllers/action/ActionListCtrl.js'
			})
		)
			.state(
				'action/add',
				angularAMD.route({
					url: '/action/add',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js'
				})
		)
			.state(
				'action/add/preview',
				angularAMD.route({
					url: '/action/add/preview',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js',
				})
		)
			.state(
				'action/add/develop',
				angularAMD.route({
					url: '/action/add/:action',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js'
				})
		)
			.state(
				'action/modify',
				angularAMD.route({
					url: '/action/{id:[a-zA-Z0-9]{24,}}',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js',
				})
		)
			.state(
				'action/preview',
				angularAMD.route({
					url: '/action/{id:[a-zA-Z0-9]{24,}}/preview',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js',
				})
		)
			.state(
				'action/modify/develop',
				angularAMD.route({
					url: '/action/{id:[a-zA-Z0-9]{24,}}/:action',
					templateUrl: '/views/action-input',
					controllerUrl: '/scripts/controllers/action/ActionCtrl.js',
				})
		)
		// EVENTS
		.state(
			'event',
			angularAMD.route({
				url: '/event',
				templateUrl: '/views/event-list',
				controllerUrl: '/scripts/controllers/event/EventListCtrl.js'
			})
		)
			.state(
				'event/add',
				angularAMD.route({
					url: '/event/add',
					templateUrl: '/views/event-input',
					controllerUrl: '/scripts/controllers/event/EventCtrl.js'
				})
		)
			.state(
				'event/modify',
				angularAMD.route({
					url: '/event/{id:[a-zA-Z0-9]{24,}}',
					templateUrl: '/views/event-input',
					controllerUrl: '/scripts/controllers/event/EventCtrl.js'
				})
		)
			.state(
				'event/modify/specific',
				angularAMD.route({
					url: '/event/{id:[a-zA-Z0-9]{24,}}/:type/:specific',
					templateUrl: '/views/event-input',
					controllerUrl: '/scripts/controllers/event/EventCtrl.js'
				})
		)
	});

	app.run(function($rootScope) {
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
			$rootScope.previousId = fromParams.id;
		});
	});

	app.value('configs', {
		'domainName': 'smartassist.kopeltechdev.com',
		'appName': 'Simpl Assist'
	});

	angularAMD.bootstrap(app);

	return app;
});