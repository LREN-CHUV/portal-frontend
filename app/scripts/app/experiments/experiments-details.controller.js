"use strict";

angular
  .module("chuvApp.experiments")
  .controller("ExperimentDetailsController", [
    "$stateParams",
    "$state",
    "MLUtils",
    "$scope",
    "$timeout",
    "User",
    "Config",
    "Model",
    "Variable",
    function(
      $stateParams,
      $state,
      MLUtils,
      $scope,
      $timeout,
      User,
      Config,
      Model,
      Variable
    ) {
      var refresh_rate = 10000; // ms
      var cancel_timeout;
      var cancelled = false;
      $scope.loading = true;
      $scope.model_slug = $stateParams.model_slug;

      $scope.get_display_type = MLUtils.get_display_type;

      function compute_overview_graph(overview) {
        return {
          chart: {
            type: "column",
            height: 200
          },
          exporting: { enabled: false },
          legend: {
            enabled: false
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0
            }
          },
          series: overview.data,
          title: {
            text: ""
          },
          loading: false,
          xAxis: {
            categories: overview.label,
            labels: {
              enabled: false
            },
            tickLength: 0
          },
          yAxis: {
            title: {
              text: overview.label
            }
          }
        };
      }

      if ($stateParams.model_slug) {
        // we have a slug: load model
        Model.get({ slug: $stateParams.model_slug }, function(result) {
          $scope.model = result;
          $scope.query = result.query;

          $scope.query.display = {};
          Variable.datasets().then(data => {
            $scope.query.display.trainingDatasets = $scope.query.trainingDatasets.map(
              t => data.find(d => d.code === t.code)
            );
            $scope.query.display.validationDatasets = $scope.query.validationDatasets.map(
              t => data.find(d => d.code === t.code)
            );
          });
        });
      }

      function link_charts_legend(chart) {
        // chart.options.chart.events = {
        //   redraw: function() {
        //     $(".single-legend").empty();
        //     var chart = this;
        //     $(chart.series).each(function(i, serie) {
        //       $(
        //         '<li style="color: ' +
        //           (serie.visible ? serie.color : "grey") +
        //           '">' +
        //           serie.name +
        //           "</li>"
        //       )
        //         .click(function() {
        //           $(".overview-charts > div > div").each(function() {
        //             var series = $(this).highcharts().series[serie.index];
        //             if (series.visible) {
        //               series.hide();
        //             } else {
        //               series.show();
        //             }
        //           });
        //         })
        //         .appendTo(".single-legend");
        //     });
        //   }
        // };
      }

      function get_experiment() {
        Config.then(config => {
          $scope.federationmode = config.mode === "federation";
        })
          .then(() => {
            MLUtils.get_experiment($stateParams.experiment_uuid).then(
              function on_get_experiment_success(response) {
                if (cancelled) {
                  return;
                }
                $scope.loading = false;
                const data = response.data;
                $scope.experiment = data;

                try {
                  // Refresh experiment until done
                  if (!cancelled && !data.finished) {
                    cancel_timeout = $timeout(get_experiment, refresh_rate);
                    return;
                  }

                  // data.result ? data.result : data;

                  // catch error before parsing
                  if (!angular.isObject(data.result)) {
                    throw data.result;
                  }

                  // federated nodes distributed results
                  if ($scope.federationmode && data.validations.length) {
                    //data.result.map(r => angular.isArray(r.data)).every(r => r)) {
                    $scope.isFederationResult = true;

                    const experiments = [];
                    data.result.forEach((result, i) => {
                      // TODO: same structure responses from api
                      const resultData = angular.isArray(result.data)
                        ? result.data
                        : [result];

                      const experiment = MLUtils.parse_distributed_results(
                        resultData
                      );
                      experiment.methods.map(method => {
                        if (!method.overview) {
                          method.title = "Overview";
                          return;
                        }
                        method.overview_charts = method.overview.map(
                          compute_overview_graph
                        );
                        method.title = method.title || "Validation details";
                      });

                      experiment.nodeName = resultData[0].node || "node";

                      experiments.push(experiment);
                    });

                    $scope.experiments = experiments;

                    $scope.experiment = angular.extend(data, {
                      finished: true,
                      hasError: false,
                      name: data.name
                    });

                    if (!data.resultsViewed) {
                      MLUtils.mark_as_read($scope.experiment);
                    }

                    return;
                  }

                  $scope.isFederationResult = false;
                  $scope.experiment = angular.extend(data, {
                    finished: true,
                    hasError: false,
                    name: data.name
                  });
                  $scope.experiment.display = MLUtils.parse_results(
                    data.result
                  );

                  // Prepare charts
                  const methods = $scope.experiment.display.methods;
                  $scope.overview_charts =
                    methods &&
                    methods.length &&
                    methods[0].overview &&
                    methods[0].overview.map(compute_overview_graph);
                } catch (e) {
                  $scope.experiment = $scope.experiment
                    ? $scope.experiment
                    : {};
                  $scope.experiment.hasError = true;
                  $scope.experiment.finished = true;
                  $scope.experiment.result = data.result;
                  console.log(e);
                } finally {
                  // Mark as read
                  if (!data.resultsViewed) {
                    MLUtils.mark_as_read(data);
                  }
                }
              },
              function on_get_experiment_fail(response) {
                if (cancelled) {
                  return;
                }
                $scope.loading = false;
                $scope.experiment = {
                  hasError: true,
                  result: response.data
                    ? response.status +
                        " " +
                        response.data.error +
                        "\n" +
                        response.data.message
                    : "This experiment doesn't exist",
                  finished: true
                };
                MLUtils.mark_as_read($scope.experiment);
              }
            );
          })
          .catch(e => {
            $scope.loading = false;
            $scope.finished = true;
          });
      }

      get_experiment();

      $scope.$on("$destroy", function() {
        if (cancel_timeout) {
          cancelled = true;
          $timeout.cancel(cancel_timeout);
        }
      });

      var user;
      $scope.sharing_working = false;
      User.get().then(function() {
        user = User.current();
      });

      $scope.experiment_is_mine = function() {
        return $scope.experiment.createdBy.username === user.username;
      };

      $scope.mark_experiment_as_unshared = function() {
        $scope.sharing_working = true;
        MLUtils.mark_as_unshared($scope.experiment).then(
          function() {
            $scope.experiment.shared = false;
            $scope.sharing_working = false;
          },
          function() {
            $scope.experiment.shared = true;
            $scope.sharing_working = false;
          }
        );
      };
      $scope.mark_experiment_as_shared = function() {
        $scope.sharing_working = true;
        MLUtils.mark_as_shared($scope.experiment).then(
          function() {
            $scope.experiment.shared = true;
            $scope.sharing_working = false;
          },
          function() {
            $scope.experiment.shared = false;
            $scope.sharing_working = false;
          }
        );
      };
    }
  ]);
