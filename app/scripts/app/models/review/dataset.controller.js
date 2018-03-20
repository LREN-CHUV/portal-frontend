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
  "$q",
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
    $state,
    $q
  ) {
    $scope.tableLoading = true;
    $scope.tableError = undefined;
    $scope.tableHeader = undefined;
    $scope.tableRows = undefined;

    $scope.histogramLoading = true;
    $scope.histogramError = undefined;
    $scope.histogramData = undefined;

    $scope.boxplotLoading = true;
    $scope.boxplotError = undefined;
    $scope.boxplotData = undefined;

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
    $scope.query.filterQuery = !_.isEmpty(search.filterQuery)
      ? JSON.parse(search.filterQuery)
      : null;
    $scope.query.trainingDatasets = map_query("trainingDatasets");

    let selectedVariables = [];
    let selectedDatasets = [...$scope.query.trainingDatasets.map(d => d.code)];

    const getDependantVariable = () =>
      (_.isUndefined($scope.query.variables[0])
        ? null
        : $scope.query.variables[0]);

    const miningRequest = () =>
      Config.then(config => config.mode === "local").then(isLocal => {
        $scope.isLocal = isLocal;

        // Forge session cache key with filter & selected variables
        const sessionStorageKey =
          ($scope.query.filterQuery
            ? JSON.stringify($scope.query.filterQuery)
            : "all") +
          "-" +
          [
            ...$scope.query.variables,
            ...$scope.query.groupings,
            ...$scope.query.coVariables
          ].map(a => a.code);

        // retrieve cache if existing
        const results = sessionStorage.getItem(sessionStorageKey);
        if (results) {
          const json = JSON.parse(results);

          return $q.resolve(json);
        }

        // Forge and start requests for variables in all datasets
        return $q
          .all(
            $scope.allDatasets.map(d =>
              Model.mining({
                algorithm: {
                  code: isLocal ? "statisticsSummary" : "statisticsSummary", //"WP_VARIABLE_SUMMARY", FIXME once Exareme format is ready
                  name: isLocal ? "statisticsSummary" : "statisticsSummary", // "WP_VARIABLE_SUMMARY",
                  parameters: [],
                  validation: false
                },
                variables: $scope.query.variables,
                grouping: $scope.query.groupings,
                covariables: $scope.query.coVariables,
                datasets: [{ code: d.code }],
                filters: $scope.query.textQuery
                  ? JSON.stringify($scope.query.filterQuery)
                  : ""
              })
            )
          )
          .then(response => {
            const datasets = response.map(r => r.data.data).map((r, i) => ({
              data: r.data,
              name: $scope.allDatasets[i].code
            }));
            sessionStorage.setItem(sessionStorageKey, JSON.stringify(datasets));

            return datasets;
          });
      });

    // Charts ressources

    const filterBySelectedDataset = datasets =>
      datasets.filter(d => selectedDatasets.includes(d.name));

    const getStatistics = () => {
      if (!selectedDatasets.length) {
        $scope.tableError = "Please, select at least one dataset.";
        $scope.tableLoading = false;
        $scope.tableHeader = null;
        $scope.tableRows = null;

        return;
      }

      $scope.tableError = null;
      $scope.tableLoading = true;

      const filterByGroupAll = datasets =>
        datasets.map(dataset =>
          dataset.data.filter(r => r.group && r.group[0] === "all")
        );

      const orderByVariable = datasets =>
        [
          ...$scope.query.variables,
          ...$scope.query.groupings,
          ...$scope.query.coVariables
        ].map(variable => ({
          variable,
          data: datasets.map(dataset =>
            dataset.find(r => r.index === variable.code)
          )
        }));

      const addDetailData = rows =>
        $q
          .all(rows.map(row => Variable.getVariableData(row.variable.code)))
          .then(data =>
            rows.map((r, i) =>
              Object.assign({}, r, {
                parent: data[i].parent,
                variable: data[i].data
              })
            )
          );

      const formatTable = data => {
        const tableRows = [];
        data
          .sort(
            (a, b) =>
              (a.parent.code < b.parent.code
                ? -1
                : a.parent.code === b.parent.code ? 0 : 1)
          )
          .forEach((d, i) => {
            let row;
            if (
              i === 0 ||
              (d.parent && i > 0 && d.parent.code !== data[i - 1].parent.code)
            ) {
              row = {
                header: true,
                data: [d.parent.label, ...selectedDatasets.map(() => "")] // hack for colspan
              };
              tableRows.push(row);
            }
            tableRows.push(d);
          });

        return tableRows;
      };

      let rows;
      miningRequest()
        .then(filterBySelectedDataset)
        .then(filterByGroupAll)
        .then(orderByVariable)
        .then(addDetailData)
        .then(data => {
          $scope.tableHeader = [
            "Variables",
            ...$scope.allDatasets
              .filter(d => selectedDatasets.includes(d.code))
              .map(s => s.code)
          ];
          $scope.tableRows = formatTable(data);
          $scope.tableLoading = false;
          $scope.tableError = null;
        })
        .catch(e => {
          const { statusText } = e;
          $scope.tableError = statusText;
          $scope.tableHeader = null;
          $scope.tableRows = null;
          $scope.tableLoading = false;
          console.log(e);
        });
    };

    const getTSNE = () =>
      Model.mining({
        algorithm: {
          code: "tSNE",
          name: "tSNE",
          parameters: [],
          validation: false$scope.boxplotError
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

    $scope.getHistogram = function() {
      const variable = getDependantVariable();
      return variable
        ? Variable.get_histo(
            variable.code,
            selectedDatasets.map(code => ({ code })),
            $scope.query.textQuery
              ? JSON.stringify($scope.query.filterQuery)
              : ""
          ).then(
            response => {
              var data = response.data && response.data.data;
              if (!angular.isArray(data)) {
                data = [data];
              }
              $scope.histogramData = data.map(function(stat) {
                var series =
                  stat &&
                  stat.series &&
                  stat.series.length &&
                  stat.series[0].data;
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
            },
            e => {
              $scope.histogramLoading = false;
              const { statusText } = e;
              $scope.histogramError = statusText;
              console.log(e);
            }
          )
        : null;
    };

    const getBoxplot = () => {
      if (!selectedDatasets.length) {
        $scope.boxplotError = "Please, select at least one dataset.";
        $scope.boxplotLoading = false;
        $scope.boxplotData = null;

        return;
      }

      $scope.boxplotError = null;
      $scope.boxplotLoading = true;

      const filterByVariable = datasets => ({
        variables: [
          ...$scope.query.variables,
          ...$scope.query.coVariables
        ].map(variable => ({
          variable,
          data: datasets.map(dataset =>
            dataset.data.filter(
              r => r.mean && r.index === variable.code && r.group[0] !== "all"
            )
          )
        })),
        datasetNames: datasets.map(d => d.name)
      });

      const shapeData = ({ variables, datasetNames }) =>
        variables
          .map(variable => ({
            categories: _.flatten(
              variable.data.map((datasets, i) =>
                datasets.map(v => `${datasetNames[i]}-${v.group.join("-")}`)
              )
            ),
            series: [].concat.apply(
              [],
              variable.data.map(datasets =>
                datasets.map(v => [v.min, v["25%"], v["50%"], v["75%"], v.max])
              )
            ),
            variable: variable.variable
          }))
          .filter(d => d.series.length);

      miningRequest()
        .then(filterBySelectedDataset)
        .then(filterByVariable)
        .then(shapeData)
        .then(data => {
          if (!data || !data.length) {
            $scope.boxplotLoading = false;
            $scope.boxplotError = "Please select other variables to plot";
            $scope.boxplotData = null;

            return;
          }

          $scope.boxplotData = data.map(d => ({
            chart: {
              type: "boxplot"
            },
            title: null,
            xAxis: {
              categories: d.categories,
              title: null
            },
            yAxis: {
              title: null
            },
            series: [
              {
                name: d.variable.code,
                data: d.series
              }
            ]
          }));

          $scope.boxplotError = null;
          $scope.boxplotLoading = false;
        })
        .catch(e => {
          $scope.boxplotLoading = false;
          $scope.boxplotError =
            "There was an error while processing. Please try again later.";
          $scope.boxplotData = null;

          return;
        });
    };

    $scope.isSelected = function(variable) {
      return selectedVariables.includes(variable);
    };

    $scope.selectDataset = code => {
      if (selectedDatasets.includes(code)) {
        const index = selectedDatasets.indexOf(code);
        selectedDatasets.splice(index, 1);
      } else {
        selectedDatasets.push(code);
      }
      $location.search("trainingDatasets", selectedDatasets.join(","));

      init();
    };

    $scope.isDatasetSelected = code => {
      return selectedDatasets.includes(code);
    };

    // init
    const init = (model = {}) => {
      $scope
        .loadResources(model)
        .then(() =>
          Variable.datasets().then(data => {
            $scope.allDatasets = data;

            const variable = getDependantVariable();
            if (!variable) {
              $scope.tableError =
                "Please, select some variables in the previous screen.";
              return;
            }

            getStatistics();
            getBoxplot();
            // $scope.getHistogram();

            // retrieve filterQuery as sql text, hack queryBuilder
            if ($scope.query.filterQuery) {
              const $element = $("<div>");
              const qb = $element.queryBuilder({
                rules: $scope.query.filterQuery,
                filters: $scope.getFilterVariables(),
                allow_empty: true,
                inputs_separator: " - "
              });

              $scope.query.textQuery = qb.queryBuilder(
                "getSQL",
                false,
                false
              ).sql;
              qb.queryBuilder("destroy");
            }
          })
        )
        .catch(console.log);
    };

    $scope.$on("event:configureFilterQueryFinished", () => {
      $location.search("filterQuery", JSON.stringify($scope.query.filterQuery));
      init();
    });

    $scope.$on("event:loadModel", function(evt, model) {
      selectedDatasets = [...$scope.query.trainingDatasets.map(d => d.code)];
      init(model);
    });

    if ($stateParams.slug === undefined) {
      init();
    }

    // comfortable export button close
    $scope.exportPannel = false;
    $scope.toogleExport = function() {
      $scope.exportPannel = !$scope.exportPannel;
    };
    let exportTimer;
    $scope.exportClose = function() {
      exportTimer = $timeout(() => {
        $scope.exportPannel = false;
      }, 1000);
    };
    $scope.exportCloseDeny = function() {
      $timeout.cancel(exportTimer);
    };
  }
]);
