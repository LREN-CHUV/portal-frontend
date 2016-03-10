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

    function _map (variable) {
      return { "code": variable.code };
    }

    var child_scope = $scope.$new(),
      promise1 = Model.estimateQuery($scope.shared.chosen_estimation, {
        request: { plot: "linearRegression" },
        covariables: $scope.query.coVariables.map(_map),
        variables: $scope.query.variables.map(_map),
        filters: $scope.query.filters.map(_map),
        grouping: $scope.query.groupings.map(_map)
      }),
      promise2 = $http.get("/mocks/estimations/" + $scope.shared.chosen_estimation + ".json");

    promise1.then(function (result) {
      child_scope.result = result.data;
      child_scope.help_is_open = false;
    });

    promise2.then(function (result) {
      child_scope.estimation = result.data;
    });

    $q.all([promise1, promise2]).then(function () {
        $scope.loading_estimation = false;
        child_scope.help_is_open = false;

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
          template: "<div class='modal-header'><h1>Sorry!</h1></div><div class='modal-body'> <h2>There was an error fetching the results</h2></div>"
        });
      }
    );

  };
}]);
