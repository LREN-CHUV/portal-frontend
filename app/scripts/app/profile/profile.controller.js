/**
 * Created by Michael DESIGAUD on 09/09/2015.
 */
'use strict';

angular.module("chuvApp.profile").controller("ProfileController", [
  "$scope",
  "$translatePartialLoader",
  "$translate",
  "$stateParams",
  "User",
  function(
    $scope,
    $translatePartialLoader,
    $translate,
    $stateParams,
    User
  ) {
    User.get().then(function(data) {
      $scope.user = data.data;
    });
  }
]);
