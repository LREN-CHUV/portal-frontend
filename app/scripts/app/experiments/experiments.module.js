angular.module('chuvApp.experiments', ['ngResource', 'ui.router', 'chuvApp.util'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
        .state('experiment', {
            url: '/experiment/:slug',
            templateUrl: 'scripts/app/experiments/experiment.html',
            controller:'ExperimentController'
        })
    }]);
