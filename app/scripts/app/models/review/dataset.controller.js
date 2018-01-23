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
  "$state",
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
    $state,
    $uibModal
  ) {
    var hierarchy = {};
    $scope.selectedVariables = [];
    $scope.loading = true;
    $scope.datasets = [];

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

    Variable.datasets().then(function(datasets) {
      $scope.datasets = datasets;
    });

    var getDependantVariable = function() {
      return (
        ($scope.query &&
          $scope.query.variables &&
          $scope.query.variables.length &&
          $scope.query.variables[0]) ||
        null
      );
    };

    var dependantVariable = getDependantVariable();

    //
    $scope.$on("event:loadModel", function(evt, model) {
      $scope.loadResources(model);
      dependantVariable = getDependantVariable();
      if (dependantVariable) $scope.selectVariable(dependantVariable);
    });

    if ($stateParams.slug === undefined) {
      $scope.loadResources({});
    }

    // Table resources
    // Variable.parent(dependantVariable)
    // .then(function(parent) {

    var rows = [
      [
        dependantVariable.code,
        "76.5 (SD 3.32)",
        "71.5 (SD 3.34)",
        "72.1 (SD 3.28)"
      ]
    ];
    $scope.query.coVariables.forEach(function(c) {
      rows.push([c.code, "76.5 (SD 3.32)", "71.5 (SD 3.34)", "72.1 (SD 3.28)"]);
    });
    $scope.query.groupings.forEach(function(c) {
      rows.push([c.code, "76.5 (SD 3.32)", "71.5 (SD 3.34)", "72.1 (SD 3.28)"]);
    });

    $scope.table = rows;
    // })
    // .catch(function(e) {
    //   console.log(e);
    // });

    // Charts ressources
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
      $scope.loading = true;
      // keep a book of selected variables, minus the dependant one
      if (
        dependantVariable && focusedVariable.code !== dependantVariable.code
      ) {
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
              min: 0,
              max: 1,
              av: series.reduce(function(a, b) {
                return a + b;
              }) / series.length
            },
            chart: stat.chart,
            xAxis: stat.xAxis,
            yAxis: stat.yAxis,
            series: stat.series,
            title: stat.title
          };
        });
        $scope.loading = false;
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

      Variable.getStatistics(focusedVariable.code).then(
        function(response) {
          console.log("getStatistics", response);
        },
        function() {
          console.log("Error");
        }
      );
    };

    $scope.open_experiment = function() {
      if ($scope.model && $scope.model.slug) {
        return $state.go("new_experiment", { model_slug: $scope.model.slug });
      }

      function unmap_category(category) {
        return $scope.query[category]
          .map(function(variable) {
            return variable.code;
          })
          .join(",");
      }

      var query = {
        variables: unmap_category("variables"),
        coVariables: unmap_category("coVariables"),
        groupings: unmap_category("groupings"),
        filters: unmap_category("filters"),
        textQuery: $location.search().textQuery,
        graph_config: $scope.chartConfig,
        model_slug: ""
      };

      return $state.go("new_experiment", query);
    };

    $scope.open_experiment = function() {
      if ($scope.model && $scope.model.slug) {
        return $state.go("new_experiment", { model_slug: $scope.model.slug });
      }

      function unmap_category(category) {
        return $scope.query[category]
          .map(function(variable) {
            return variable.code;
          })
          .join(",");
      }

      var query = {
        variables: unmap_category("variables"),
        coVariables: unmap_category("coVariables"),
        groupings: unmap_category("groupings"),
        filters: unmap_category("filters"),
        textQuery: $location.search().textQuery,
        graph_config: $scope.chartConfig,
        model_slug: ""
      };

      return $state.go("new_experiment", query);
    };

    // init
    if (dependantVariable) {
      $scope.selectVariable(dependantVariable);
    }
  }
]);
