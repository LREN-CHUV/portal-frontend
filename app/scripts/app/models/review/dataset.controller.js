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

    const init = () => {
      let datasets = [
        { code: "adni" },
        { code: "epfl_adni" },
        { code: "chuv_adni" }
      ];
      let dataRows = []; // [{ variable, data: [] }, ]

      $scope.datasets = datasets;
      $scope.tableHeader = ["Variables", ...datasets.map(d => d.code)];

      const allVariables = [
        ...$scope.query.variables,
        ...$scope.query.groupings,
        ...$scope.query.coVariables
      ];

      let promises = [];
      allVariables.forEach(a => {
        datasets.forEach(d =>
          promises.push(
            Model.mining({
              algorithm: {
                code: "WP_VARIABLE_SUMMARY",
                name: "WP_VARIABLE_SUMMARY",
                parameters: [],
                validation: false
              },
              variables: [a],
              grouping: [],
              coVariables: [],
              datasets: [d.code]
            })
          )
        );
      });

      Promise.all(promises) // constructs table by variable
        .then(results => {
          results.forEach(r => {
            const data = r.data.data;
            const variable = data.code;
            const average = data.average && parseFloat(data.average).toFixed(2);
            const min = data.min && parseFloat(data.min).toFixed(2);
            const max = data.max && parseFloat(data.max).toFixed(2);

            const value = `${average} (${min}-${max})`;
            const row = dataRows.find(d => d.variable === variable);
            if (row) {
              row.data.push(value);
            } else {
              dataRows.push({ variable, data: [value] });
            }
          });

          return Promise.all(
            dataRows.map(d => ({ code: Variable.parent(d.variable) }))
          );
        })
        .then(rows => {
          // add parent row for Each Variable
          rows = [{ code: "Occipital" }, { code: "Occipital" }];
          let dataRowsWithParent = [];

          rows.forEach((d, index) => {
            const parent = dataRowsWithParent.find(p => p.variable === d.code);
            if (parent) {
              dataRowsWithParent.push(dataRows[index]);
            } else {
              dataRowsWithParent.push({
                variable: d.code,
                data: $scope.tableHeader.map(_ => ""),
                type: "header"
              });
              dataRowsWithParent.push(dataRows[index]);
            }
          });

          console.log(dataRowsWithParent);
          $scope.tableRows = dataRowsWithParent;
          $scope.loading = false;
        })
        .catch(e => {
          console.log(e);
        });
    };

    init();

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
      // $scope.loading = true;
      // // keep a book of selected variables, minus the dependant one
      // if (
      //   dependantVariable &&
      //   focusedVariable.code !== dependantVariable.code
      // ) {
      //   var selected = $scope.selectedVariables;
      //   if (selected.includes(focusedVariable)) {
      //     var index = selected.findIndex(function(v) {
      //       return v.code === focusedVariable.code;
      //     });
      //     $scope.selectedVariables.splice(index, 1);
      //   } else {
      //     $scope.selectedVariables.push(focusedVariable);
      //   }
      // }
      // var format = function(response) {
      //   var data = response.data && response.data.data;
      //   if (!angular.isArray(data)) {
      //     data = [data];
      //   }
      //   $scope.plots = data.map(function(stat) {
      //     var series =
      //       stat && stat.series && stat.series.length && stat.series[0].data;
      //     return {
      //       stats: {
      //         count: series && series.length,
      //         min: 0,
      //         max: 1,
      //         av:
      //           series.reduce(function(a, b) {
      //             return a + b;
      //           }) / series.length
      //       },
      //       chart: stat.chart,
      //       xAxis: stat.xAxis,
      //       yAxis: stat.yAxis,
      //       series: stat.series,
      //       title: stat.title
      //     };
      //   });
      //   $scope.loading = false;
      // };
      // var error = function() {
      //   $scope.hasError = true;
      // };
      // if ($scope.selectedVariables.length) {
      //   getCustomHistogram(dependantVariable, $scope.selectedVariables).then(
      //     format,
      //     error
      //   );
      //   return;
      // }
      // getHistogram(focusedVariable).then(format, error);
      // Variable.getStatistics(focusedVariable.code).then(
      //   function(response) {
      //     console.log("getStatistics", response);
      //   },
      //   function() {
      //     console.log("Error");
      //   }
      // );
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
  }
]);
