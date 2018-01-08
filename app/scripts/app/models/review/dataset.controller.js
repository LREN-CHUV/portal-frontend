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
  "$uibModal",
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
    $location,
    $uibModal
  ) {
    $scope.selectedVariables = [];

    // params key/values
    var search = $location.search();
    function map_query(category) {
      return search[category]
        ? search[category].split(",").map(function(code) {
            return { code: code };
          })
        : [];
    }

    $scope.query.variables = map_query("variable");
    $scope.query.groupings = map_query("grouping");
    $scope.query.coVariables = map_query("covariable");
    $scope.query.filters = map_query("filter");
    $scope.query.textQuery = search.query;

    var dependantVariable = $scope.query.variables[0];

    var getHistogram = function(variable) {
      return Variable.get_histo(variable.code);
    };

    var getCustomHistogram = function(variable, groupings) {
      return Variable.getCustomHistogram(
        variable.code,
        groupings,
        $scope.query.textQuery
      );
    };

    $scope.isSelected = function(variable) {
      return $scope.selectedVariables.includes(variable);
    };

    $scope.selectVariable = function(focusedVariable) {
      // keep a book of selected variables, minus the dependant one
      if (focusedVariable.code !== dependantVariable.code) {
        var selected = $scope.selectedVariables;
        if (selected.includes(focusedVariable)) {
          var index = selected.findIndex(function(v) {
            return v.code === focusedVariable.code;
          });
          $scope.selectedVariables.splice(index, 1);
        } else {
          $scope.selectedVariables.push(focusedVariable);
        }
      }

      var format = function(response) {
        var data = response.data && response.data.data;

        if (!angular.isArray(data)) {
          data = [data];
        }

        $scope.plots = data.map(function(stat) {
          var series =
            stat && stat.series && stat.series.length && stat.series[0].data;
          return {
            stats: {
              count: series && series.length,
              min: Math.min(...series),
              max: Math.max(...series),
              av: series.reduce(function(a, b) {
                return a + b;
              }) / series.length
            },
            options: {
              chart: stat.chart
            },
            xAxis: stat.xAxis,
            yAxis: stat.yAxis,
            series: stat.series,
            title: stat.title
          };
        });
      };

      var error = function() {
        $scope.hasError = true;
      };

      if ($scope.selectedVariables.length) {
        getCustomHistogram(dependantVariable, $scope.selectedVariables).then(
          format,
          error
        );
        return;
      }

      getHistogram(focusedVariable).then(format, error);
    };

    // init
    $scope.selectVariable(dependantVariable);
  }
]);
