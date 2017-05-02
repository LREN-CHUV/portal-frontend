/**
 * Created by Michael DESIGAUD on 09/09/2015.
 */
angular.module("chuvApp.profile").controller("ProfileController", [
  "$scope",
  "$translatePartialLoader",
  "$translate",
  "$stateParams",
  "User",
  "$http",
  "backendUrl",
  function(
    $scope,
    $translatePartialLoader,
    $translate,
    $stateParams,
    User,
    $http,
    backendUrl
  ) {
    User.get().then(function(data) {
      $scope.user = data.data;
    });
  }
]);
