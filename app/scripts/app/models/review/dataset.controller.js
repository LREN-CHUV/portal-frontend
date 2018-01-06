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
    $scope.dataset = {};

    // params key/values
    var params = $location.search();
    Object.keys(params).map(function(param) {
      var value = params[param];
      $scope.dataset[param] = /,/.test(value) 
      ? value.split(",").map(function(code) {
          return { code: code };
        })
      : { code: value }
    })

    $scope.setfocusedVariable = function(focusedVariable) {
      Variable.get_histo(focusedVariable.code).then(
        function(response) {
          var stats = response.data && response.data.data;
          
          if (!angular.isArray(stats)) {
            stats = [stats];
          }

          $scope.stats = stats.map(function(stat){
            return {
              options: {
                chart: stat.chart
              },
              xAxis: stat.xAxis,
              yAxis: stat.yAxis,
              series: stat.series,
              title: stat.title
            };
          })
        },
        function() {
          $scope.hasError = true;
        }
      );
    };

    // init
    var dependantVariable = $scope.dataset.variable;
    $scope.setfocusedVariable(dependantVariable);
  }
]);
