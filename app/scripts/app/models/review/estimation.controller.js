/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models').controller('EstimationController',['$scope', '$q', '$http', '$modal', function($scope, $q, $http, $modal) {

  $scope.chosen_estimations = {};

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

  $scope.can_estimate_model = function () {
    return Object.keys($scope.chosen_estimations).length > 0;
  };

  $scope.estimate_model = function () {
    $scope.loading_estimations = true;

    var child_scope = $scope.$new();
    child_scope.estimations = {};
    child_scope.parametrization = {};
    child_scope.help_is_open = true;
    child_scope.parametrization_is_correct = function (estimation_id) {
      return _.all(
        child_scope.estimations[estimation_id].parameters,
        function (parameter) { return !!child_scope.parametrization[parameter.id] }
      )
    };

    $q.all(
      Object
        .keys($scope.chosen_estimations)
        .map(function (estimation_id) {
          var promise = $http.get("/mocks/estimations/" + estimation_id + ".json");
          promise.then(function (result) {
            child_scope.estimations[estimation_id] = result.data;
          });
          return promise;
        })
    ).then(
      function () {
        // all get succeeded
        $scope.loading_estimations = false;

        child_scope.run_estimation = function (estimation_id) {
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
        $scope.loading_estimations = false;

        $modal.open({
          size: "md",
          template: "<h1>Sorry!</h1> <h2>There was an error fetching the results</h2>"
        });
      }
    );

  };
}]);
