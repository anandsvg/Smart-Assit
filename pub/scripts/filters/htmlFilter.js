angular.module('htmlToText', [])
	.filter('htmlToText', function() {
		return function(text) {
			return String(text).replace(/<[^>]+>/gm, '');
		}
	});