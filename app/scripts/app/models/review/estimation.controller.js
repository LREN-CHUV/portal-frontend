/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

"use strict";

angular.module("chuvApp.models").controller("EstimationController", [
  "$scope",
  "$state",
  "$location",
  function($scope, $state, $location) {
    $scope.open_experiment = function() {
      if ($scope.model && $scope.model.slug) {
        return $state.go("new_experiment", { model_slug: $scope.model.slug });
      }

      function unmap_category(category) {
        return $scope.query[category]
          .map(function(variable) {
            return variable.code;
          })
          .join(",");
      }

      var query = {
        variables: unmap_category("variables"),
        coVariables: unmap_category("coVariables"),
        groupings: unmap_category("groupings"),
        filters: unmap_category("filters"),
        textQuery: $location.search().textQuery,
        graph_config: $scope.chartConfig
      };

      return $state.go("new_experiment", query);
    };

    //$scope.shared = {
    //  chosen_estimation: null
    //};
    //
    //$scope.possible_estimations = [{
    //  id: "glr",
    //  label: "General Linear Regression (GLR)"
    //}, {
    //  id: "anv",
    //  label: "Anova"
    //}, {
    //  id: "genetic",
    //  label: "Genetic Model",
    //  disabled: true
    //}];
    //
    //$scope.estimate_model = function () {
    //  $scope.loading_estimation = true;
    //
    //  function _map (variable) {
    //    return { "code": variable.code };
    //  }
    //
    //  var child_scope = $scope.$new(),
    //    promise1 = Model.estimateQuery($scope.shared.chosen_estimation, {
    //      algorithm: "linearRegression",
    //      covariables: $scope.query.coVariables.map(_map),
    //      variables: $scope.query.variables.map(_map),
    //      filters: $scope.query.filters.map(_map),
    //      grouping: $scope.query.groupings.map(_map)
    //    }),
    //    promise2 = $http.get("/mocks/estimations/" + $scope.shared.chosen_estimation + ".json");
    //
    //  promise1.then(function (result) {
    //    child_scope.result = result.data;
    //    child_scope.help_is_open = false;
    //
    //    child_scope.variable_title = function (variable_code) {
    //      // capitalize
    //      return variable_code
    //        .split(/[ _\-]/)
    //        .map(function (code_part) { return code_part.replace(/^[a-z]/, function (str) {return str.toUpperCase(); })})
    //        .join(" ");
    //    };
    //
    //    child_scope.pvalue_quality = function (pvalue) {
    //      pvalue = Math.abs(pvalue);
    //      if (pvalue <= 0.001) return "(★★★)";
    //      if (pvalue <= 0.01) return "(★★)";
    //      if (pvalue <= 0.1) return "(★)";
    //      return "";
    //
    //    }
    //  });
    //
    //  promise2.then(function (result) {
    //    child_scope.estimation = result.data;
    //  });
    //
    //  $q.all([promise1, promise2]).then(function () {
    //      $scope.loading_estimation = false;
    //      child_scope.help_is_open = false;
    //
    //      $modal.open({
    //        size: "lg",
    //        scope: child_scope,
    //        templateUrl: "scripts/app/models/review/estimation-" + $scope.shared.chosen_estimation + ".html"
    //      });
    //    },
    //    function () {
    //      // fail
    //      $scope.loading_estimation = false;
    //
    //      $modal.open({
    //        size: "md",
    //        template: "<div class='modal-header'><h1>Sorry!</h1></div><div class='modal-body'> <h2>There was an error fetching the results</h2></div>"
    //      });
    //    }
    //  );
    //
    //};
  }
]);
