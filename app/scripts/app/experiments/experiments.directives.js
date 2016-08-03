'use strict';
angular.module('chuvApp.experiments')

  .directive("algorithmRunner", ['MLUtils', 'Model', '$stateParams', '$state', function (MLUtils, Model, $stateParams, $state) {

    return {
      templateUrl: "/scripts/app/experiments/algorithm-runner.html",
      scope: true,
      controller: ['$scope', function ($scope) {

        $scope.shared.kfold = 2;

        $scope.run_experiment = function () {

          if (!$scope.model) {
            $scope.save_model();
            return;
          }

          var validations = [];
          if ($scope.shared.cross_validation) {
            validations.push({"code":"kfold", "parameters": [{"code": "k", "value": $scope.shared.kfold}]})
          }

          //$scope.running = true;
          var promise = MLUtils.run_experiment({
            model: $scope.model.slug,
            validations: validations,
            algorithms: $scope.shared.experiment_configuration,
            name: $scope.shared.experiment_name
          });

          promise.then(function (result) {
            //$state.go(result.data.uuid);
            $state.go('experiment_details', {
              model_slug: $scope.model.slug,
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
  .directive('otherExperiments', ['MLUtils', '$http', '$compile', function (MLUtils, $http, $compile) {

    return {
      templateUrl: "/scripts/app/experiments/other-experiments.html",
      replace: true,
      scope: {
        modelSlug: '=',
        minimal: '=',
        onlyPositive: '='
      },
      controller: ["$scope", function ($scope) {
        $scope.open_popover = function () {
          MLUtils.list_experiments($scope.modelSlug).then(function (response) {
            if (!!$scope.onlyPositive) {
              $scope.model_experiments = _.filter(
                response.data,
                function (experiment) { return !!experiment.finished && !experiment.hasError && !experiment.hasServerError; }
              );
            } else {
              $scope.model_experiments = response.data;
            }
          });
        };

        $scope.get_drag_data = function (experiment) {

          var result = JSON.parse(experiment.result);
          return '<table class="table table-striped table-bordered">' +
            '<tr>' +
            '<th>Algorithm</th>' +
            '<th>Mean square error</th>' +
            '<th>Root mean square error</th>' +
            '<th>Coefficient of determination (R&sup2;)</th>' +
            '<th>Fac2 fit ratio</th>' +
            '</tr>' +
            result.map(function (experiment_result) {
              return '<tr>' +
                '<td>' + experiment_result.name + '</td>' +
                '<td>' + experiment_result.data.cells.validations[0].data.average.MSE + '</td>' +
                '<td>' + experiment_result.data.cells.validations[0].data.average.RMSE + '</td>' +
                '<td>' + experiment_result.data.cells.validations[0].data.average.R2 + '</td>' +
                '<td>' + experiment_result.data.cells.validations[0].data.average.FAC2 + '</td>' +
                '</tr>';
            }).join('') +
            '</table>' +
            '<p><a href="/experiment/' + experiment.model.slug + '/' + experiment.uuid + '">' + experiment.name + '</p>';
        }
      }]
    }
  }]);
