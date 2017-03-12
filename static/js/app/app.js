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
        'cgNotify'
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
    });
/*.factory('SocketFactory', function (socketFactory) {
 return socketFactory();
 });*/