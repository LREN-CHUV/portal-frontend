"use strict";

angular.module("chuvApp.models").controller("DatasetController", [
  "$scope",
  "$stateParams",
  "Model",
  "ChartUtil",
  "filterFilter",
  "Variable",
  "Group",
  "Config",
  "$rootScope",
  "$log",
  "$timeout",
  "$location",
  "$state",
  function(
    $scope,
    $stateParams,
    Model,
    ChartUtil,
    filterFilter,
    Variable,
    Group,
    Config,
    $rootScope,
    $log,
    $timeout,
    $location,
    $state
  ) {
    $scope.loading = true;
    $scope.error = undefined;
    $scope.tableHeader = undefined;
    $scope.tableRows = undefined;

    $scope.histogramLoading = true;
    $scope.histogramError = undefined;
    $scope.histogramData = undefined;

    $scope.tsneLoading = true;
    $scope.tsneError = undefined;
    $scope.tsneData = undefined;

    $scope.datasets = [
      { label: "chuv", code: "chuv" }
      // { label: "brescia", code: "brescia" }
      // { label: "plovdiv", code: "plovdiv" },
      // { label: "adni", code: "epfl_adni" },
      // { label: "ppmi", code: "ppmi" }
    ];

    let mode;
    let selectedVariables = [];
    let selectedDatasets = [...$scope.datasets.map(d => d.code)];

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
    $scope.query.datasets = map_query("datasets");
    $scope.query.textQuery = search.query;

    const statistics = () => {
      $scope.loading = true;
      let dataRows = []; // [{ variable, data: [] }, ]

      $scope.tableHeader = [
        "Variables",
        ...selectedDatasets.map(
          s => $scope.datasets.find(d => s === d.code).label
        )
      ];

      // stack variables
      const allVariables = [
        ...$scope.query.variables,
        ...$scope.query.groupings,
        ...$scope.query.coVariables
      ];

      // forge queries
      Config.then(config => {
        mode = config.mode;
        console.log({ mode });
        return mode;
      })
        .then(mode => {
          const local = mode === "local";
          let promises = [];
          allVariables.forEach(a => {
            selectedDatasets.forEach(d => {
              promises.push(
                Model.mining({
                  algorithm: {
                    code: local ? "statisticsSummary" : "WP_VARIABLE_SUMMARY",
                    name: local ? "statisticsSummary" : "WP_VARIABLE_SUMMARY",
                    parameters: [],
                    validation: false
                  },
                  variables: [a],
                  grouping: [],
                  coVariables: [],
                  datasets: [{ code: d }],
                  filters: ""
                })
              );
            });
          });

          return promises;
        })
        .then(promises => {
          // constructs table by variable | dataset
          Promise.all(promises)
            .then(results => {
              results.forEach(r => {
                const data = r.data.data;
                const variable = data.code; // FIXME: code, label in  Variable.getData
                const average =
                  data.average && parseFloat(data.average).toFixed(2);
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
                dataRows.map(d => Variable.getData(d.variable))
              );
            })
            .then(rows => {
              // add parent row for Each Variable
              let dataRowsWithParent = [];

              rows.forEach((row, index) => {
                const parent = dataRowsWithParent.find(
                  p => p.variable === row.parent.code
                );
                if (parent) {
                  dataRowsWithParent.push(dataRows[index]);
                } else {
                  dataRowsWithParent.push({
                    variable: row.parent.code,
                    data: $scope.tableHeader.map(_ => ""), // hack for colspan
                    type: "header"
                  });
                  dataRowsWithParent.push(dataRows[index]);
                }
              });

              $scope.tableRows = dataRowsWithParent;
              $scope.loading = false;
            })
            .catch(e => {
              $scope.loading = false;
              $scope.error = e;
            });
        });
    };

    const tsne = () =>
      Model.mining({
        algorithm: {
          code: "tSNE",
          name: "tSNE",
          parameters: [],
          validation: false
        },
        variables: $scope.query.variables,
        grouping: $scope.query.groupings,
        coVariables: $scope.query.coVariables,
        // datasets: selectedDatasets,
        filters: ""
      })
        .then(result => {
          $scope.tsneLoading = false;
          $scope.tsneData = result;
        })
        .catch(e => {
          $scope.tsneError = e;
          $scope.tsneLoading = false;
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

    // Charts ressources
    var getHistogram = function(variable) {
      return Variable.get_histo(variable.code);
    };

    $scope.isSelected = function(variable) {
      return selectedVariables.includes(variable);
    };

    var format = function(response) {
      var data = response.data && response.data.data;
      if (!angular.isArray(data)) {
        data = [data];
      }
      $scope.histogramData = data.map(function(stat) {
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
      $scope.histogramLoading = false;
    };

    var error = function(e) {
      $scope.histogramLoading = false;
      $scope.histogramError = e;
    };

    $scope.selectDataset = dataset => {
      if (selectedDatasets.includes(dataset)) {
        const index = selectedDatasets.indexOf(dataset);
        selectedDatasets.splice(index, 1);
      } else {
        selectedDatasets.push(dataset);
      }
      statistics();
    };

    $scope.isDatasetSelected = dataset => {
      return selectedDatasets.includes(dataset);
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
    $scope.$on("event:loadModel", function(evt, model) {
      $scope.loadResources(model);
      statistics();
      // tsne();
      getHistogram(getDependantVariable()).then(format, error);
    });

    if ($stateParams.slug === undefined) {
      $scope.loadResources({});
      statistics();
      // tsne();
      getHistogram(getDependantVariable()).then(format, error);
    }
  }
]);
