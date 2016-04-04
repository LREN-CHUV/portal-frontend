/**
 * Created by Michael DESIGAUD on 09/09/2015.
 */
angular.module('chuvApp.users').controller('UserController', ['$scope', '$translatePartialLoader', '$translate', '$stateParams','User','$http','backendUrl',
  function ($scope, $translatePartialLoader, $translate, $stateParams, User, $http, backendUrl) {

    $http.get(backendUrl+"/users/"+$stateParams.username).success(function(data) {
      $scope.user = data;
    });

}]);
