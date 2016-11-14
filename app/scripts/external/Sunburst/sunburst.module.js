
angular.module('chuvApp.sunburst', ['ngResource','ui.router'])
.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    .state('sunburst', {
        url: '/hbpapps/sunburst',
        templateUrl: 'scripts/app/sunburst/index.html',
        controller:'sunburstController'
    })
}]);
