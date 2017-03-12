'use strict';

/**
 * @ngdoc function
 * @name picastApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the picastApp
 */
angular.module('picastApp')
    .controller('HomeCtrl', ['$scope', '$filter', 'PiCastService', 'notify', function ($scope, $filter, PiCastService, notify) {
        $scope.formatSliderLabel = function (value) {
            var val = $filter('secondsToTime')(value);
            val = $filter('date')(val, 'HH:mm:ss');
            return val
        };

        $scope.cast = function (url) {
            PiCastService.castNow(url).then(function (result) {
                if (result == "1") {
                    var state = 'success';
                    var msg = 'Success ! Video should now be playing.';
                    notify(msg)
                }
            })
        };

        $scope.queue = function (url) {
            PiCastService.addToQueue(url).then(function (result) {
                if (result == "1") {
                    var state = 'success';
                    var msg = 'Success ! Video has been added to queue.';
                    notify(msg);
                }
            })
        };
    }]);