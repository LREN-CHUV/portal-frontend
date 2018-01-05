"use strict";

angular.module("chuvApp.models").controller("DatasetController", [
  "$scope",
  "$stateParams",
  "Model",
  "ChartUtil",
  "filterFilter",
  "Variable",
  "Group",
  "$rootScope",
  "$log",
  "$timeout",
  "$location",
  function(
    $scope,
    $stateParams,
    Model,
    ChartUtil,
    filterFilter,
    Variable,
    Group,
    $rootScope,
    $log,
    $timeout,
    $location
  ) {
    $scope.stats = [];

    $scope.setVariable = function(focusedVariable) {
      console.log(focusedVariable);
      Variable.get_histo(focusedVariable.code).then(
        function(response) {
          $scope.stats = response.data && response.data.data;

          if (!angular.isArray($scope.stats)) {
            $scope.stats = [$scope.stats];
          }
        },
        function() {
          $scope.hasError = true;
        }
      );
    };

    // this is to overcome a ng-highcharts sizing bug.
    $scope.show_stats_after_timeout = function(statistics) {
      $scope.stats.forEach(function(stat) {
        stat.active = false;
      });

      statistics.active = true;
      $scope.show = false;
      $timeout(function() {
        $scope.show = true;
      }, 0);
    };
  }
]);
