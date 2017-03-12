'use strict';

/**
 * @ngdoc function
 * @name picastApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the picastApp
 */
angular.module('picastApp')
    .controller('MainCtrl', ['$scope', 'PiCastService', '$rootScope', '$interval', function ($scope, PiCastService, $rootScope, $interval) {
        PiCastService.getStatus();
        $interval(PiCastService.getStatus, 1000);

        $rootScope.$on('player_status_update', function (evt, status) {
            $scope.player_status = status;
        });
    }]);