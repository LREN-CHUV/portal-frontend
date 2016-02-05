
/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */

'use strict';

angular.module('chuvApp.models').config(['$stateProvider',function($stateProvider){

    $stateProvider
        .state('explore', {
          url: '/explore',
          templateUrl: 'scripts/app/models/variable_exploration/explore.html',
          controller: 'ExploreController'
        })
        .state('review', {
            url: '/review',
            templateUrl: 'scripts/app/models/review/review.html',
            controller:'ReviewController'
        });
}]);
