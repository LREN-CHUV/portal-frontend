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
    $scope.query.trainingDatasets = map_query("trainingDatasets");

    let selectedVariables = [];
    let selectedDatasets = [...$scope.query.trainingDatasets.map(d => d.code)];

    const statistics = () => {
      $scope.loading = true;
      $scope.tableHeader = ["Variables", ...selectedDatasets];
      let rows = [];
      // format
      // const rows = [
      //   {
      //     code,
      //     variable: { label },
      //     parent: { code, label }
      //     datasets: [{ code, label }],
      //     continuous: [{ min, max, mean }],
      //     nominal: [[{ key, count }]]
      //     }
      // ];

      // Get local or federation mode
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
        .then(data => // flatten [[]]
          [].concat.apply([], data.map(d => d.data.data.map(e => e)))
        )
        .then(data => // all variables reduced by code field
          data.reduce((total, amount) => {
            const existing = total.find(a => a.index === amount.index);
            const isNominal = Object.keys(amount.count).length > 1;

            if (existing) {
              existing[isNominal ? "nominal" : "continuous"].push(amount);
            } else {
              const value = { index: amount.index };
              value[[isNominal ? "nominal" : "continuous"]] = [amount];
              total.push(value);
            }

            return total;
          }, [])
        )
        .then(data => {
          // Surcharge with variable data
          rows = data;
          return Promise.all(data.map(d => Variable.getVariableData(d.index)));
        })
        .then(data =>
          rows.map((r, i) =>
            Object.assign({}, r, {
              parent: data[i].parent,
              variable: data[i].data,
              datasets: selectedDatasets
            })
          )
        )
        .then(data => {
          rows = data;

          $scope.tableRows = formatTable(data);
          $scope.loading = false;
        })
        .catch(e => {
          $scope.loading = false;
          $scope.error = e;
          console.log(e);
        });
    };

    // Format for angular
    const formatTable = data => {
      const tableRows = [];
      data.forEach(d => {
        let row;
        if (d.parent) {
          row = {
            header: true,
            data: [d.parent.label, ...selectedDatasets.map(() => "")]
          };
          tableRows.push(row);
        }

        if (d.continuous) {
          row = {
            data: [
              d.variable.label,
              ...d.continuous.map(e => {
                const mean = e.mean && parseFloat(e.mean).toFixed(2);
                const min = e.min && parseFloat(e.min).toFixed(2);
                const max = e.max && parseFloat(e.max).toFixed(2);

                return `${mean} (${min}-${max})`;
              })
            ]
          };
          tableRows.push(row);
        } else {
          row = {
            data: [d.variable.label, ...selectedDatasets.map(() => "")]
          };
          tableRows.push(row);

          tableRows.push(
            ...Object.keys(d.nominal[0].count).map(k => ({
              sub: true,
              data: [k, ...d.nominal.map(e => e.count[k])]
            }))
          );
        }
      });

      return tableRows;
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
      $location.search("trainingDatasets", selectedDatasets.join(","));

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
        trainingDatasets: unmap_category("trainingDatasets"),
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
      selectedDatasets = [...$scope.query.trainingDatasets.map(d => d.code)];
      init(model);
    });

    if ($stateParams.slug === undefined) {
      init();
    }
  }
]);
