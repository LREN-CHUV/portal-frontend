'use strict';
angular.module('chuvApp.experiments')

  .directive("algorithmRunner", ['MLUtils', 'Model', '$stateParams', '$state', function (MLUtils, Model, $stateParams, $state) {

    var cross_val_mocks = {
      real: [
        {
          "k": 10,
          "seed": "i281731z2uqzewze",
          "folds": [
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            },
            {
              "mse": 100.20,
              "rmse": 56.56,
              "fac2": 0.45,
              "r2": 0.56
            }
          ],
          "overall_mse": 100.20,
          "overall_rmse": 56.56,
          "overall_fac2": 0.45,
          "overall_r2": 0.56
        }
      ],
      binary: [
        {
          "k": 10,
          "seed": "i281731z2uqzewze",
          "folds": [
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            },
            {
              "confusion": [[1, 2], [2, 4]],
              "accuracy": 0.35,
              "precision": 0.45,
              "recall": 0.21
            }
          ],
          "overall_confusion": [[1, 2], [2, 4]],
          "overall_accuracy": 0.5,
          "overall_precision": 0.34,
          "overall_recall": 0.16
        }
      ],
      polynomial: [
        {
          "k": 10,
          "seed": "i281731z2uqzewze",
          "folds": [
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            },
            {
              "confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
              "accuracy": 0.35
            }
          ],
          "overall_confusion": [[1, 2, 6], [2, 4, 1], [5, 3, 1]],
          "overall_accuracy": 0.5
        }
      ]
    };

    return {
      templateUrl: "/scripts/app/experiments/algorithm-runner.html",
      scope: true,
      controller: ['$scope', function ($scope) {

        $scope.shared.kfold = 2;

        $scope.run_experiment = function () {
          //$scope.running = true;

          MLUtils.run_experiment({
            model: $stateParams.model_slug,
            validations: [{"code":"kfold", "label": "kfold", "parameters": [{"code": "k", "value": $scope.shared.kfold}]}],
            algorithms: $scope.shared.experiment_configuration,
            name: $scope.shared.experiment_name
          }).then(function (result) {
            //$state.go(result.data.uuid);
            $state.go('experiment_details', {
              model_slug: $stateParams.model_slug,
              experiment_uuid: result.data.uuid
            });
          }, function () {
            $scope.error = true;
          });
        }

      }]
    }
  }])
  .directive('runningExperiments', ['MLUtils', '$state', '$timeout', 'User', function (MLUtils, $state, $timeout, User) {
    return {
      templateUrl: "/scripts/app/experiments/running-experiments.html",
      replace: true,
      controller: ["$scope", function ($scope) {
        $scope.is_open = false;
        $scope.experiments = [];
        $scope.unread_count = 0;

        $scope.should_display = function () {
          return $scope.is_open || $state.is('experiment');
        };

        // on open
        $scope.$watch('is_open', function () {
          if ($scope.is_open) {
            refresh_running_experiments();
          }
        });

        function refresh_running_experiments () {
          if (!User.hasCurrent()) return;

          MLUtils.list_my_experiments().then(function (response) {
            $scope.experiments = response.data;
            $scope.unread_count = _.reduce(
              $scope.experiments,
              function (current_count, experiment) { return current_count + (experiment.finished && !experiment.resultsViewed ? 1 : 0); },
              0
            );
          });
        }

        var repeat_running = true;

        function repeat_refresh_running_experiments () {
          refresh_running_experiments();
          if (repeat_running)
            $timeout(repeat_refresh_running_experiments, 5000);
        }

        User.get().then(repeat_refresh_running_experiments);
      }]
    }
  }])
  .directive('otherExperiments', ['MLUtils', '$http', function (MLUtils, $http) {
    return {
      templateUrl: "/scripts/app/experiments/other-experiments.html",
      replace: true,
      scope: {
        modelSlug: '='
      },
      controller: ["$scope", function ($scope) {
        MLUtils.list_experiments($scope.modelSlug).then(function (response) {
          $scope.model_experiments = response.data;
        })
      }]
    }
  }]);
