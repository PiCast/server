'use strict';

/**
 * @ngdoc function
 * @name picastApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the picastApp
 */
angular.module('picastApp')
    .controller('MainCtrl', ['$scope', 'PiCastService', '$rootScope', '$interval', 'notify', function ($scope, PiCastService, $rootScope, $interval, notify) {
        PiCastService.getStatus();
        $interval(PiCastService.getStatus, 1000);

        $rootScope.$on('error', function (evt, message) {
            notify.closeAll();
            notify(message)
        });

        $rootScope.$on('player_status_update', function (evt, status) {
            $scope.player_status = status;
             $rootScope.$broadcast('rzSliderForceRender');
        });
    }]);