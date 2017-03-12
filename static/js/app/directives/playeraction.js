(function () {
	'use strict';
	/**
	 * @ngdoc directive
	 * @name passmanApp.directive:passwordGen
	 * @description
	 * # passwordGen
	 */
	angular.module('picastApp')
		.directive('playerAction', ['PiCastService', 'notify', function (PiCastService, notify) {
			return {
				restrict: 'A',
				scope: {
					action: '=playerAction'
				},
				link: function (scope, el) {
                    el.click(function () {
                        PiCastService.doAction(scope.action).then(function () {
							if(scope.action == 'nextqueue'){
								  notify("Success ! Video should now be playing.");
							}
                        })
                    })
				}
			};
		}]);
}());