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

    // params key/values
    var search = $location.search();
    const map_query = category =>
      (search[category]
        ? search[category].split(",").map(code => ({ code }))
        : []);

    $scope.query.variables = map_query("variable");
    $scope.query.groupings = map_query("grouping");
    $scope.query.coVariables = map_query("covariable");
    $scope.query.filters = map_query("filter");
    $scope.query.datasets = map_query("datasets");

    let selectedVariables = [];
    let selectedDatasets = [...$scope.query.datasets.map(d => d.code)];

    // TODO: refactor this
    const statistics = () => {
      $scope.loading = true;
      $scope.tableHeader = ["Variables", ...selectedDatasets];

      let dataRows = []; // [{ index, label, data: [], type: "" }, ]

      // Get local or federation mode
      let datasets = [];
      Config.then(config => config.mode === "local")
        // Forge queries for variable's statistics by dataset
        .then(isLocal =>
          Promise.all(
            selectedDatasets.map(d =>
              Model.mining({
                algorithm: {
                  code: isLocal ? "statisticsSummary" : "WP_VARIABLE_SUMMARY",
                  name: isLocal ? "statisticsSummary" : "WP_VARIABLE_SUMMARY",
                  parameters: [],
                  validation: false
                },
                variables: $scope.query.variables,
                grouping: $scope.query.groupings,
                covariables: $scope.query.coVariables,
                datasets: [{ code: d }],
                filters: ""
              })
            )
          )
        )
        .then(response => response.map(r => r.data))
        .then(datasets => // flatten [[]]
          [].concat.apply(
            [],
            datasets.map(dataset => dataset.data.data.map(d => d))
          )
        )
        .then(data => {
          // reduce each variable in a dict {index, label, type: null, data: [col1, col2]}
          data.forEach(dataRow => {
            const index = dataRow.index;
            const mean = dataRow.mean && parseFloat(dataRow.mean).toFixed(2);
            const min = dataRow.min && parseFloat(dataRow.min).toFixed(2);
            const max = dataRow.max && parseFloat(dataRow.max).toFixed(2);
            const countKeys = Object.keys(dataRow.count);

            if (countKeys.length === 1) {
              // continuous values
              const value = `${mean} (${min}-${max})`;
              const row = dataRows.find(d => d.index === index);
              if (row) {
                row.data.push(value);
              } else {
                dataRows.push({ index, data: [value], type: null });
              }
            } else {
              // nominal
              const row = dataRows.find(d => d.index === index);
              const value = countKeys
                .map(k => `${k}: ${dataRow.count[k]}`)
                .join("<br>");
              if (row) {
                row.data.push(value);
              } else {
                dataRows.push({ index, data: [value], type: null });
              }
            }
          });

          $scope.tableRows = dataRows;
          $scope.loading = false;

          return Promise.all(
            dataRows.map(d => Variable.getVariableData(d.index))
          );
        })
        .then(rows => {
          // add parent row for Each Variable
          let dataRowsWithParent = [];
          rows.forEach((row, i) => {
            const parent = dataRowsWithParent.find(
              p => p.index === row.parent.code
            );
            const dataRow = dataRows[i];
            dataRow.label = row.data.label;

            if (parent) {
              dataRowsWithParent.push(dataRow);
            } else {
              // push parent and 1st children
              dataRowsWithParent.push({
                index: row.parent.code,
                label: row.parent.label,
                data: $scope.tableHeader.map(_ => ""), // hack for colspan
                type: "header"
              });
              dataRowsWithParent.push(dataRow);
            }
          });

          $scope.tableRows = dataRowsWithParent;
          $scope.loading = false;
        })
        .catch(e => {
          $scope.loading = false;
          $scope.error = e;
          console.log(e);
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

    $scope.selectDataset = code => {
      if (selectedDatasets.includes(code)) {
        const index = selectedDatasets.indexOf(code);
        selectedDatasets.splice(index, 1);
      } else {
        selectedDatasets.push(code);
      }
      $location.search("datasets", selectedDatasets.join(","));

      statistics();
    };

    $scope.isDatasetSelected = code => {
      return selectedDatasets.includes(code);
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
        datasets: unmap_category("datasets"),
        graph_config: $scope.chartConfig,
        model_slug: ""
      };

      return $state.go("new_experiment", query);
    };

    // init
    const init = (model = {}) => {
      $scope.loadResources(model);
      Variable.datasets().then(data => {
        $scope.allDatasets = data;

        statistics();
        // tsne();
        getHistogram(getDependantVariable()).then(format, error);
      });
    };

    $scope.$on("event:loadModel", function(evt, model) {
      init(model);
    });

    if ($stateParams.slug === undefined) {
      init();
    }
  }
]);
