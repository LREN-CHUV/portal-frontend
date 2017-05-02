/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
angular.module("chuvApp.home").controller("TosController", [
  "$scope",
  "$rootScope",
  "$state",
  "User",
  function($scope, $rootScope, $state, User) {
    User.get().then(function() {
      if (User.hasAgreedTos()) {
        $state.go("home");
      }
    });

    $scope.agreeTos = function() {
      User.agreeTos().then(function() {
        $state.go("home");
      });
    };
  }
]);
