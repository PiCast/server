(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name passmanApp.TagService
     * @description
     * # TagService
     * Service in the passmanApp.
     */
    angular.module('picastApp')
        .service('PiCastService', ['$http', '$rootScope', function ($http, $rootScope) {
            return {
                getStatus: function () {
                    return $http.get('/status').then(function (result) {
                        var data = result.data;
                        $rootScope.$emit('player_status_update', data);
                        return data
                    })
                },
                getPlaylist: function () {
                    return $http.get('/playlist').then(function (result) {
                        var data = result.data;
                        $rootScope.$emit('player_playlist_update', data);
                        return data
                    })
                },
                castNow: function (url) {
                    var url_encoded_url = encodeURIComponent(url);
                    return $http.get('/stream?url=' + url_encoded_url).then(function (result) {
                        return result.data;
                    });
                },
                addToQueue: function (url) {
                    var url_encoded_url = encodeURIComponent(url);
                    return $http.get('/queue?url=' + url_encoded_url).then(function (result) {
                        return result.data;
                    });
                },
                scheduleShutdown: function (seconds) {
                    return $http.get('/shutdown?time=' + seconds).then(function (result) {
                        return result.data;
                    });
                },
                doAction: function (action) {
                    var endpoint;
                    switch (action) {
                        case 'pause':
                            endpoint = '/video?control=pause';
                            break;
                        case 'stop':
                            endpoint = '/video?control=stop';
                            break;

                        case 'backward':
                            endpoint = '/video?control=left';
                            break;

                        case 'forward':
                            endpoint = '/video?control=right';
                            break;

                        case 'nextqueue':
                            endpoint = '/video?control=next';
                            break;

                        case 'vol_down':
                            endpoint = '/sound?vol=less';
                            break;

                        case 'vol_up':
                            endpoint = '/sound?vol=more';
                            break;
                    }

                    return $http.get(endpoint).then(function (result) {
                        return result.data;
                    })
                }
            };
        }]);
}());