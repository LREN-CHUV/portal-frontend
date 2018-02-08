angular.module("chuvApp.components.config").factory("Config", [
  "$resource",
  function($resource) {
    return $resource("/scripts/app/config.json").get().$promise;
  }
]);
