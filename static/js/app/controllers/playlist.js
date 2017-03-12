'use strict';

/**
 * @ngdoc function
 * @name picastApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the picastApp
 */
angular.module('picastApp')
    .controller('PlaylistCtrl', ['$scope', 'PiCastService', '$rootScope', '$interval', function ($scope, PiCastService, $rootScope, $interval) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
        PiCastService.getPlaylist();
        $interval(PiCastService.getPlaylist, 10000)

        $rootScope.$on('player_playlist_update', function (evt, status) {
            $scope.playlist = status;
        });

        // $scope.playerAction = function (action) {
        //     SocketFactory.emit('player_action', {action: action});
        // };
        //
        // SocketFactory.on('player_status_update', function (data) {
        //     $scope.status = data;
        // });
        // $scope.log = [];
        // SocketFactory.on('player_stdout', function (data) {
        //     $scope.log.push(data);
        // });
    }]);