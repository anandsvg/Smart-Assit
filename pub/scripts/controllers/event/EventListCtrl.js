define([
	'app',
	'/scripts/factories/EventModel.js'
], function(app, EventModel) {
	app.register.controller('EventListCtrl', function($scope, EventModel) {
		var $this = this;
		$scope.events = {};

		if (!EventModel.isLoaded()) {
			EventModel.load(function() {
				$scope.events = EventModel.get();
			});
		} else {
			$scope.events = EventModel.get();
		}

		this.remove = function(_id) {
			EventModel.remove(_id);
		};
	});
});