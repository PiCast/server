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
            if (!url) {
                notify("You must enter a valid url!");
                return;
            }
            notify("Trying to get video stream URL. Please wait ~ 10-20 seconds.");
            PiCastService.castNow(url).then(function (result) {
                if (result == "1") {
                    var state = 'success';
                    var msg = 'Success ! Video should now be playing.';
                    notify.closeAll();
                    notify(msg)
                } else {
                    notify("An error occured during the treatment of the demand. Please make sure the link/action is compatible");
                }
            })
        };

        $scope.queue = function (url) {
            if (!url) {
                notify("You must enter a valid url!");
                return;
            }
            notify("Trying to add video to queue.");
            PiCastService.addToQueue(url).then(function (result) {
                if (result == "1") {
                    var state = 'success';
                    var msg = 'Success ! Video has been added to queue.';
                    notify.closeAll();
                    notify(msg);
                } else {
                    notify("An error occured during the treatment of the demand. Please make sure the link/action is compatible");
                }
            })
        };
    }]);