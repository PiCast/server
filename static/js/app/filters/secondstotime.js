'use strict';
/**
 * @ngdoc filter
 * @name picastApp.filter:secondsToTime
 * @function
 * @description
 * # secondsToTime
 * Filter in the picastApp.
 */
angular.module('picastApp')
  .filter('secondsToTime', [function() {
      return function(seconds) {
          return new Date(1970, 0, 1).setSeconds(seconds);
      };
  }]);