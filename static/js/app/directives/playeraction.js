(function () {
	'use strict';
	/**
	 * @ngdoc directive
	 * @name passmanApp.directive:passwordGen
	 * @description
	 * # passwordGen
	 */
	angular.module('picastApp')
		.directive('playerAction', ['PiCastService', function (PiCastService) {
			return {
				restrict: 'A',
				scope: {
					action: '=playerAction'
				},
				link: function (scope, el) {
                    el.click(function () {
                        PiCastService.doAction(scope.action)
                    })
				}
			};
		}]);
}());