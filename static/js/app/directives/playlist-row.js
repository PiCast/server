(function () {
    'use strict';
    /**
     * @ngdoc directive
     * @name passmanApp.directive:passwordGen
     * @description
     * # passwordGen
     */
    angular.module('picastApp')
        .directive('playlistRow', ['PiCastService', 'notify', function (PiCastService, notify) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    element.on('mouseenter', function () {
                        $(element).find('.sorter').css('background','rgba(0, 0, 0, 0.40)');
                        $(element).find('.glyphicon').removeClass('hidden');
                    });
                    element.on('mouseleave', function () {
                        $(element).find('.glyphicon').addClass('hidden');
                        $(element).find('.sorter').css('background','transparent');
                    });
                }
            };
        }]);
}());