"use strict";
angular
  .module("chuvApp.experiments")
  .directive("algorithmRunner", [
    "MLUtils",
    "Model",
    "$stateParams",
    "$state",
    function(MLUtils, Model, $stateParams, $state) {
      return {
        templateUrl: "/scripts/app/experiments/algorithm-runner.html",
        scope: true,
        controller: [
          "$scope",
          function($scope) {
            $scope.shared.kfold = 2;

            $scope.run_experiment = function() {
              // Ensure that the associated model is saved
              if (!$scope.model) {
                $scope.save_model($scope.run_experiment);
                return;
              }

              var validations = [];
              if ($scope.shared.cross_validation) {
                validations.push({
                  code: "kfold",
                  parameters: [{ code: "k", value: $scope.shared.kfold }]
                });
              }

              //$scope.running = true;
              var promise = MLUtils.run_experiment({
                model: $scope.model.slug,
                validations: validations,
                algorithms: $scope.shared.experiment_configuration,
                name: $scope.shared.experiment_name,
                datasets: $scope.datasets.filter(
                  (d, i) => $scope.shared.experiment_datasets[i]
                )
              });

              promise.then(
                function(result) {
                  //$state.go(result.data.uuid);
                  $state.go("experiment_details", {
                    model_slug: $scope.model.slug,
                    experiment_uuid: result.data.uuid
                  });
                },
                function() {
                  $scope.error = true;
                }
              );
            };
          }
        ]
      };
    }
  ])
  .directive("runningExperiments", [
    "MLUtils",
    "$state",
    "$interval",
    "User",
    function(MLUtils, $state, $interval, User) {
      return {
        templateUrl: "/scripts/app/experiments/running-experiments.html",
        replace: true,
        controller: [
          "$scope",
          function($scope) {
            $scope.is_open = false;
            $scope.experiments = [];
            $scope.unread_count = 0;

            $scope.should_display = function() {
              return $scope.is_open || $state.is("experiment");
            };

            // on open
            $scope.$watch("is_open", function() {
              if ($scope.is_open) {
                refresh_running_experiments();
              }
            });

            function refresh_running_experiments() {
              if (!User.hasCurrent()) {
                return;
              }

              MLUtils.list_my_experiments().then(function(response) {
                $scope.experiments = response.data;
                $scope.unread_count = _.reduce(
                  $scope.experiments,
                  function(current_count, experiment) {
                    return (
                      current_count +
                      (experiment.finished && !experiment.resultsViewed ? 1 : 0)
                    );
                  },
                  0
                );
              });
            }

            function repeat_refresh_running_experiments() {
              refresh_running_experiments();
              $interval(refresh_running_experiments, 2000);//TODO Remove this hardcoded value!
            }

            User.get().then(repeat_refresh_running_experiments);
          }
        ]
      };
    }
  ])
  //TODO Useful?
  .directive("otherExperiments", [
    "MLUtils",
    function(MLUtils) {
      return {
        templateUrl: "/scripts/app/experiments/other-experiments.html",
        replace: true,
        scope: {
          modelSlug: "=",
          minimal: "=",
          onlyPositive: "="
        },
        controller: [
          "$scope",
          function($scope) {
            $scope.open_popover = function() {
              MLUtils.list_experiments($scope.modelSlug).then(function(
                response
              ) {
                if (!!$scope.onlyPositive) {
                  $scope.model_experiments = _.filter(response.data, function(
                    experiment
                  ) {
                    return (
                      !!experiment.finished &&
                      !experiment.hasError &&
                      !experiment.hasServerError
                    );
                  });
                } else {
                  $scope.model_experiments = response.data;
                }
              });
            };

            $scope.get_drag_data = function(experiment) {
              var result = JSON.parse(experiment.result);
              return (
                '<table class="table table-striped table-bordered">' +
                "<tr>" +
                "<th>Algorithm</th>" +
                "<th>Mean square error</th>" +
                "<th>Root mean square error</th>" +
                "<th>Mean absolute error</th>" +
                "<th>Coefficient of determination (R&sup2;)</th>" +
                "<th>Explained variance</th>" +
                "</tr>" +
                result
                  .map(function(experiment_result) {
                    return (
                      "<tr>" +
                      "<td>" +
                      experiment_result.name +
                      "</td>" +
                      "<td>" +
                      experiment_result.data.cells.validations[0].data.average
                        .MSE +
                      "</td>" +
                      "<td>" +
                      experiment_result.data.cells.validations[0].data.average
                        .RMSE +
                      "</td>" +
                      "<td>" +
                      experiment_result.data.cells.validations[0].data.average
                        .MAE +
                      "</td>" +
                      "<td>" +
                      experiment_result.data.cells.validations[0].data.average[
                        "R-squared"
                      ] +
                      "</td>" +
                      "<td>" +
                      experiment_result.data.cells.validations[0].data.average[
                        "Explained variance"
                      ] +
                      "</td>" +
                      "</tr>"
                    );
                  })
                  .join("") +
                "</table>" +
                '<p><a href="/experiment/' +
                experiment.model.slug +
                "/" +
                experiment.uuid +
                '">' +
                experiment.name +
                "</p>"
              );
            };
          }
        ]
      };
    }
  ])
  .directive("confusionMatrix", [
    function() {
      return {
        templateUrl: "/scripts/app/experiments/confusion-matrix.html",
        replace: true,
        scope: {
          data: "="
        },
        controller: [
          "$scope",
          function($scope) {
            $scope.labels = $scope.data.labels;
            $scope.values = $scope.data.values;
          }
        ]
      };
    }
  ])
  .directive("prettyJson", [
    "$compile",
    function($compile) {
      var linker = function($scope, element) {
        // Taken from http://jsfiddle.net/KJQ9K/554/
        function syntaxHighlight(json) {
          if (typeof json != "string") {
            json = JSON.stringify(json, undefined, 2);
          }
          json = json
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function(match) {
              var cls = "number";
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = "key";
                } else {
                  cls = "string";
                }
              } else if (/true|false/.test(match)) {
                cls = "boolean";
              } else if (/null/.test(match)) {
                cls = "null";
              }
              return '<span class="' + cls + '">' + match + "</span>";
            }
          );
        }

        element.children().html(syntaxHighlight($scope.data)).show();
        $compile(element.contents())($scope);
      };

      return {
        template: "<pre><pre>",
        restrict: "E",
        link: linker,
        scope: {
          data: "="
        }
      };
    }
  ]);
