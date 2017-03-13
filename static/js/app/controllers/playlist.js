'use strict';

/**
 * @ngdoc function
 * @name picastApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the picastApp
 */
angular.module('picastApp')
    .controller('PlaylistCtrl', ['$scope', 'PiCastService', '$rootScope', '$interval', '$timeout', function ($scope, PiCastService, $rootScope, $interval, $timeout) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
        PiCastService.getPlaylist();
        $interval(PiCastService.getPlaylist, 10000);
        $scope.sortableOptions = {
            handle: '.cover-image',
            update: function () {
                PiCastService.updatePlaylist($scope.playlist);
            }
        };

        $rootScope.$on('player_playlist_update', function (evt, status) {
            $scope.playlist = status;
        });

        $rootScope.$on('action_nextqueue', function () {
            $timeout(PiCastService.getPlaylist, 250);
        });

        $scope.deleteVideo = function (video) {
            var idx = $scope.playlist.indexOf(video);
            $scope.playlist.splice(idx, 1);
             PiCastService.updatePlaylist($scope.playlist);
        }

    }]);