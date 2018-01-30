"use strict";

angular.module("chuvApp.footer").controller("FooterController", [
  "$scope",
  "Config",
  function($scope, Config) {
    Config.$promise.then(function(config) {
      $scope.version = config.version || "dev";
    });
  }
]);
