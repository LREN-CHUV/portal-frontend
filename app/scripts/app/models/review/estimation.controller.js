/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models').controller('EstimationController',['$scope', '$q', '$http', '$modal', function($scope, $q, $http, $modal) {

  $scope.shared = {
    chosen_estimation: null
  };

  $scope.possible_estimations = [{
    id: "glr",
    label: "General Linear Regression (GLR)"
  }, {
    id: "anova",
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
      return _.all(
        child_scope.estimation.parameters,
        function (parameter) { return !!child_scope.parametrization[parameter.id] }
      )
    };

    $http.get("/mocks/estimations/" + $scope.shared.chosen_estimation + ".json")
      .then(function (result) {
        // all get succeeded
        child_scope.estimation = result.data;
        $scope.loading_estimation = false;

        child_scope.run_estimation = function () {
          $http
            .get("/mocks/estimations/result.json")
            .then(function (result) {
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
