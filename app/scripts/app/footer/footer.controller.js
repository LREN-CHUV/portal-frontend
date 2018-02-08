"use strict";

angular.module("chuvApp.footer").controller("FooterController", [
  "$scope",
  "Config",
  function($scope, Config) {
    Config.then(function(config) {
      $scope.version = config.version || "dev";
      $scope.mode = config.mode || "local";
    });
  }
]);
