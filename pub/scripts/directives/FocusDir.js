angular.module('Focus', [])
	.directive('focus', function() {
	    return {
	        restrict: 'A',
	        link: function(scope, elm, attrs) {
	        	elm[0].focus();
	        }
	    };
	});	