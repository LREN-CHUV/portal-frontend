/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models').controller('EstimationController',['$scope', '$q', '$http', '$modal', 'Model', function($scope, $q, $http, $modal, Model) {

  $scope.shared = {
    chosen_estimation: null
  };

  $scope.possible_estimations = [{
    id: "glr",
    label: "General Linear Regression (GLR)"
  }, {
    id: "anv",
    label: "Anova"
  }, {
    id: "genetic",
    label: "Genetic Model"
  }];

  $scope.estimate_model = function () {
    $scope.loading_estimation = true;

    var child_scope = $scope.$new();
    child_scope.parametrization = {};
    child_scope.help_is_open = true;
    child_scope.parametrization_is_correct = function () {
      return true;
      //return _.all(
      //  child_scope.estimation.parameters,
      //  function (parameter) { return !!child_scope.parametrization[parameter.id] }
      //)
    };

    $http.get("/mocks/estimations/" + $scope.shared.chosen_estimation + ".json")
      .then(function (result) {
        // all get succeeded
        child_scope.estimation = result.data;
        $scope.loading_estimation = false;

        child_scope.run_estimation = function () {

          function _map (variable) {
            return { "code": variable.code };
          }

          Model.estimateQuery(
            $scope.shared.chosen_estimation,
            {
              request: { plot: "linearRegression" },
              covariables: $scope.query.coVariables.map(_map),
              variables: $scope.query.variables.map(_map),
              filters: $scope.query.filters.map(_map),
              grouping: $scope.query.groupings.map(_map)
            }
          ).then(function (result) {
              child_scope.result = result.data;
              child_scope.help_is_open = false;
            });
        };

        $modal.open({
          size: "lg",
          scope: child_scope,
          templateUrl: "scripts/app/models/review/estimation-modal.html"
        });
      },
      function () {
        // fail
        $scope.loading_estimation = false;

        $modal.open({
          size: "md",
          template: "<h1>Sorry!</h1> <h2>There was an error fetching the results</h2>"
        });
      }
    );

  };
}]);
