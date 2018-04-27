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
    $scope.loading = true;
    $scope.tableError = undefined;
    $scope.tableHeader = undefined;
    $scope.tableRows = undefined;

    $scope.histogramError = undefined;
    $scope.histogramData = undefined;

    $scope.boxplotError = undefined;
    $scope.boxplotData = undefined;

    $scope.heatmapLoading = true;
    $scope.heatmapError = undefined;
    $scope.heatmapData = undefined;

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
    $scope.uiSelectedDatasets = {};

    $scope.miningResponses = [];

    const getDependantVariable = () =>
      (_.isUndefined($scope.query.variables[0])
        ? null
        : $scope.query.variables[0]);

    $scope.ageGendercoVarArray = null;

    const addAgeAndGenderCovariableArray = () => {
      if ($scope.ageGendercoVarArray === null) {
        $scope.ageGendercoVarArray = angular.copy($scope.query.coVariables);
      }
      if($scope.ageGendercoVarArray.filter(covarElem => covarElem.code === "gender").length == 0 ) {
        $scope.ageGendercoVarArray.push(
          {"code":"gender"},
          {"code":"subjectageyears"});
      }
    }

    let isMining = false;
    const miningRequest = () => {
      if (isMining) return;
      isMining = true;

      Config.then(config => config.mode === "local").then(isLocal => {
        $scope.isLocal = isLocal;
        $scope.loading = true;
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

          // Check if data is present. Else remove it, try again
          if (
            json &&
            json.length &&
            json.map(j => j.data).every(d => d && d.length)
          ) {
            $scope.miningResponses = json;
            $scope.loading = false;
            return;
          } else {
            sessionStorage.removeItem(sessionStorageKey);
          }
        }

        addAgeAndGenderCovariableArray();

        // Forge and start requests for variables in all datasets
        $scope.allDatasets.forEach(d =>
          Model.mining({
            algorithm: {
              code: isLocal ? "statisticsSummary" : "statisticsSummary", //"WP_VARIABLE_SUMMARY", FIXME once Exareme format is ready
              name: isLocal ? "statisticsSummary" : "statisticsSummary", // "WP_VARIABLE_SUMMARY",
              parameters: [],
              validation: false
            },
            variables: $scope.query.variables,
            grouping: $scope.query.groupings,
            covariables: $scope.ageGendercoVarArray ? $scope.ageGendercoVarArray : $scope.query.coVariables,
            datasets: [{ code: d.code }],
            filters: $scope.query.textQuery
              ? JSON.stringify($scope.query.filterQuery)
              : ""
          })
            .then(r => {
              const data = (r && r.data && r.data.data && r.data.data.data) || [
              ]; // return a "placeholder" for the non catched dataset error
              const dataset = {
                data,
                name: d.code,
                status: data.length ? "" : "Error"
              };

              const results = $scope.miningResponses;
              const datasets = results.length ? results : [];
              const index = datasets.findIndex(rs => rs.name === d.code);
              datasets.splice(index, 1, dataset);

              isMining = false;
              $scope.miningResponses = datasets;
              if (datasets.length === $scope.allDatasets.length) {
                sessionStorage.setItem(
                  sessionStorageKey,
                  JSON.stringify(datasets)
                );
              }
            })
            .catch(e => {
              const dataset = { name: d.code, status: "Error" };
              console.log(e);
              const results = $scope.miningResponses;
              const datasets = results.length ? results : [];
              const index = datasets.findIndex(rs => rs.name === d.code);
              datasets.splice(index, 1, dataset);

              isMining = false;
              $scope.miningResponses = datasets;
            })
        );
      });
    };

    // Charts ressources

    const filterBySelectedDataset = datasets =>
      $q.resolve(datasets.filter(d => selectedDatasets.includes(d.name)));

    const getStatistics = data => {
      if (!data.length) {
        $scope.loading = true;
        return;
      }

      if (!selectedDatasets.length) {
        $scope.tableError = "Please, select at least one dataset.";
        $scope.loading = false;
        $scope.tableHeader = null;
        $scope.tableRows = null;

        return;
      }

      $scope.tableError = null;
      $scope.loading = true;

      const filterByGroupAll = datasets =>
        datasets.map(
          dataset =>
            (dataset.data &&
              dataset.data.length &&
              dataset.data.filter(r => r.group && r.group[0] === "all")) ||
            dataset
        );

      const orderByVariable = datasets => {
        addAgeAndGenderCovariableArray();
        return [
          ...$scope.query.variables,
          ...$scope.query.groupings,
          ...$scope.ageGendercoVarArray
        ].map(variable => ({
          variable,
          data: datasets.map(
            dataset =>
              (dataset &&
                dataset.length &&
                dataset.find(r => r.index === variable.code)) ||
              dataset
          )
        }));
      }

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
          .forEach((row, i) => {
            // header
            if (
              i === 0 ||
              (row.parent &&
                i > 0 &&
                row.parent.code !== data[i - 1].parent.code)
            ) {
              let headerrow = {
                header: true,
                data: [row.parent.label, ...selectedDatasets.map(() => "")] // hack for colspan
              };
              tableRows.push(headerrow);
            }

            // make a row for each category of nominal values
            if (
              row.data &&
              row.data.length &&
              row.data[0] &&
              row.data[0].frequency
            ) {
              tableRows.push(row);
              const frequencies = row.data[0].frequency;
              Object.keys(frequencies).map(key => {
                tableRows.push({
                  subrow: true,
                  variable: { label: key },
                  data: row.data.map(e => ({
                    count: (e && e.frequency && e.frequency[key]) || "-"
                  })),
                  parent: { code: key }
                });
              });
            } else {
              const computedData = row.data.map(m => {
                if (!m || m.count - m.null_count === 0) {
                  return { count: "-" };
                }

                return m;
              });
              row.data = computedData;
              tableRows.push(row);
            }
          });

        return tableRows;
      };

      let rows;
      filterBySelectedDataset(data)
        .then(filterByGroupAll)
        .then(orderByVariable)
        .then(addDetailData)
        .then(data => {
          $scope.tableHeader = [
            "Variables",
            ...$scope.allDatasets
              .filter(d => selectedDatasets.includes(d.code))
              .map(s => s.label)
          ];
          $scope.tableRows = formatTable(data);
          $scope.loading = false;
          $scope.tableError = null;
        })
        .catch(err => {
          const statusText = err && err.statusText;
          const message = err && err.data && err.data.error;
          $scope.tableError = `${statusText} : ${message}`;
          $scope.tableHeader = null;
          $scope.tableRows = null;
          $scope.loading = false;
          console.log(err);
        });
    };

    $scope.getHeatmap = () => {
      $scope.heatmapLoading = true;

      Model.mining({
        algorithm: {
          code: "correlationHeatmap",
          name: "Correlation heatmap",
          parameters: []
        },
        variables: $scope.query.variables,
        // grouping: $scope.query.groupings,
        coVariables: $scope.query.coVariables,
        datasets: selectedDatasets
      })
        .then(result => {
          $scope.heatmapLoading = false;
          $scope.heatmapData = result && result.data && result.data.data;
        })
        .catch(e => {
          $scope.heatmapLoading = false;
          $scope.heatmapError = e.xhrStatus;
        });
    };

    const getTSNE = () =>
      Model.mining({
        algorithm: {
          code: "tSNE",
          name: "tSNE",
          parameters: [],
          validation: $scope.boxplotError
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
              $scope.loading = false;
            },
            e => {
              $scope.loading = false;
              const { statusText } = e;
              $scope.histogramError = statusText;
              console.log(e);
            }
          )
        : null;
    };

    const getBoxplot = data => {
      if (!selectedDatasets.length) {
        $scope.boxplotError = "Please, select at least one dataset.";
        $scope.loading = false;
        $scope.boxplotData = null;

        return;
      }

      $scope.boxplotError = null;

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
        datasetNames: datasets.map(d => $scope.uiSelectedDatasetName(d.name))
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

      filterBySelectedDataset(data)
        .then(filterByVariable)
        .then(shapeData)
        .then(data => {
          if (!data || !data.length) {
            $scope.loading = false;
            $scope.boxplotError = "Not available for this model.";
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
          $scope.loading = false;
        })
        .catch(e => {
          $scope.boxdataplotLoading = false;
          $scope.boxplotError =
            "There was an error while processing. Please try again later.";
          $scope.boxplotData = null;

          return;
        });
    };

    $scope.isSelected = function(variable) {
      return selectedVariables.includes(variable);
    };

    $scope.uiSelectedDatasetName = code =>
      $scope.allDatasets.find(a => a.code === code).label;

    $scope.$watch(
      "uiSelectedDatasets",
      () => {
        if (!_.isEmpty($scope.uiSelectedDatasets)) {
          selectedDatasets = Object.keys($scope.uiSelectedDatasets).filter(
            s => $scope.uiSelectedDatasets[s]
          );
          $location.search("trainingDatasets", selectedDatasets.join(","));

          $rootScope.$broadcast("datasetsChanged", selectedDatasets);

          const data = $scope.miningResponses;
          getStatistics(data);
          getBoxplot(data);

          init();
        }
      },
      true
    );

    $scope.$watch(
      "miningResponses",
      () => {
        const data = $scope.miningResponses;
        getStatistics(data);
        getBoxplot(data);
      },
      true
    );

    // init
    const init = (model = {}) => {
      $scope
        .loadResources(model)
        .then(() =>
          Variable.datasets().then(data => {
            $scope.allDatasets = data;

            $scope.uiSelectedDatasets = Object.assign(
              {},
              ...$scope.allDatasets.map(d => ({
                [d.code]: selectedDatasets.includes(d.code)
              }))
            );

            const variable = getDependantVariable();
            if (!variable) {
              $scope.tableError =
                "Please, select some variables in the previous screen.";
              return;
            }

            $scope.miningResponses = $scope.miningResponses.length
              ? $scope.miningResponses
              : data.map(d => ({ name: d.code, status: "loading..." }));
            miningRequest();

            // $scope.heatmapError = () => {

            const variables = $scope.query.variables.concat(
              $scope.query.coVariables
            );
            $q
              .all(
                variables.map(variable =>
                  Variable.getVariableData(variable.code)
                )
              )
              .then(data => data.every(d => d.data && d.data.type === "real"))
              .then(isContinuous => {
                $scope.heatmapError = isContinuous
                  ? null
                  : "Please select continuous variables";
              });

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
