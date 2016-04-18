'use strict';
angular.module('chuvApp.experiments')

  .directive("algorithmRunner", ['MLUtils', 'Model', function (MLUtils, Model) {

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
    }

    return {
      templateUrl: "/scripts/app/experiments/algorithm-runner.html",
      scope: {
        query: "=",
        algorithm: "=",
      },
      controller: ['$scope', function ($scope) {

        $scope.result = {};
        $scope.k_fold = 2;
        $scope.has_run = false;

        $scope.variable_title = function (variable_code) {
          // capitalize
          return variable_code
            .split(/[ _\-]/)
            .map(function (code_part) { return code_part.replace(/^[a-z]/, function (str) {return str.toUpperCase(); })})
            .join(" ");
        };

        $scope.pvalue_quality = function (pvalue) {
          pvalue = Math.abs(pvalue);
          if (pvalue <= 0.001) return "(★★★)";
          if (pvalue <= 0.01) return "(★★)";
          if (pvalue <= 0.1) return "(★)";
          return "";
        }

        $scope.run_algorithm = function () {
          $scope.$emit("experiment_started");
          $scope.running = true;

          function _map (variable) {
            return { "code": variable.code };
          }
          Model.estimateQuery($scope.algorithm, {
            algorithm: "linearRegression",
            k_fold: $scope.k_fold,
            covariables: $scope.query.coVariables.map(_map),
            variables: $scope.query.variables.map(_map),
            filters: $scope.query.filters.map(_map),
            grouping: $scope.query.groupings.map(_map)
          }).then(function (result) {
            $scope.result[$scope.algorithm] = result.data;
            $scope.result[$scope.algorithm].cells.validations = cross_val_mocks.real;
            $scope.has_run = true;
            $scope.running = false;
          });
        }

      }]
    }
  }]);
