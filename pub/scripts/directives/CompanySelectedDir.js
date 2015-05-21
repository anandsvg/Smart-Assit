angular.module('CompanySelected', ['CurrentState'])
	.directive('companyselected', function(CurrentState) {
	    return {
	        restrict: 'A',
	        link: function(scope, elm, attrs) {	        	
	        	scope.$watch(scope.sideNav.isCompanySelected,function(){
	        		if(scope.sideNav.isCompanySelected())
	        		{
	        			elm.show();
	        		}
	        		else
	        		{
	        			elm.hide();
	        		}
	        	});	        
	        }
	    };
	});	