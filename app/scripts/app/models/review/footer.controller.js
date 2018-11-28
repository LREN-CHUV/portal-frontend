/**
 * Created by Michael DESIGAUD on 04/09/2015.
 */
"use strict";

angular.module("chuvApp.models").controller("ModelFooterController", [
  "$scope",
  "Model",
  "$state",
  "notifications",
  function($scope, Model, $state, notifications) {
    /**
   * export chart in pdf file
   */
    $scope.exportPdf = function() {
      var highChart = $scope.chartConfig.getHighcharts();
      if (highChart === undefined) {
        notifications.warning("no chart available!");
      }

      highChart.exportChart({
        type: "application/pdf",
        filename: $scope.model.slug
      });
    };

    $scope.open_experiment = function() {
      if ($scope.model && $scope.model.slug) {
        window.location.href = `/v3/experiment/${$scope.model.slug}`;
        // return $state.go("new_experiment", { model_slug: $scope.model.slug });
      } else {
        $scope.saveModel();
      }
      d;
    };

    $scope.copyModel = function() {
      Model.copy($scope.model).success(function(modelCopy) {
        $state.transitionTo(
          $state.current,
          { slug: modelCopy.slug, isCopy: "true" },
          {
            reload: true,
            inherit: true,
            notify: true
          }
        );
      });
    };
  }
]);
