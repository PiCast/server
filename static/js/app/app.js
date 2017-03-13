'use strict';

/**
 * @ngdoc overview
 * @name picastApp
 * @description
 * # picastApp
 *
 * Main module of the application.
 */
angular
    .module('picastApp', [
        'ngAnimate',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'rzModule',
        'cgNotify',
        'ui.sortable'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/static/views/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'main'
            })
            .otherwise({
                redirectTo: '/'
            });
    }).config(function ($provide, $httpProvider) {
    $provide.factory('httpInterceptor', function ($q, $rootScope) {
        return {
            response: function (response) {
                return response || $q.when(response);
            },
            responseError: function (rejection) {
                $rootScope.$emit('error', "Error ! Make sure the ip/port are corrects, and the server is running.");
                return $q.reject(rejection);
            }
        };
    });
    $httpProvider.interceptors.push('httpInterceptor');
});
/*.factory('SocketFactory', function (socketFactory) {
 return socketFactory();
 });*/