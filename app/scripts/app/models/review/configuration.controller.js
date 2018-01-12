/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

"use strict";

angular.module("chuvApp.models").controller("ConfigurationController", [
  "$scope",
  "$rootScope",
  "ChartUtil",
  function($scope, $rootScope, ChartUtil) {
    // backup of the axis configuration when switching to boxplot
    var axisConfiguration, maxYAxisVariableCount = 5;

    $scope.changeGraphType = function(type) {
      $scope.chartConfig.type = type;

      var xAxisVars = _.filter(
        _.union(
          $scope.dataset.variable,
          $scope.dataset.grouping,
          $scope.dataset.header
        ),
        $scope.canUseAsPrimaryAxis
      );
      var yAxisVars = _.filter(
        _.union(
          $scope.dataset.variable,
          $scope.dataset.grouping,
          $scope.dataset.header
        ),
        $scope.canUseAsSecondaryAxis
      );

      if (!_.contains(xAxisVars, $scope.chartConfig.xAxisVariable)) {
        $scope.chartConfig.xAxisVariable = xAxisVars.length > 0 &&
          type == "boxplot" ?
          xAxisVars[0] :
          undefined;
      }
      if (!_.contains(yAxisVars, $scope.chartConfig.yAxisVariables)) {
        $scope.chartConfig.yAxisVariables = yAxisVars.length > 0 ?
          _.first(
              yAxisVars,
              Math.min(maxYAxisVariableCount, yAxisVars.length)
            )
          : undefined;
      }

      $scope.$emit("chartConfigChanged");
    };

    $scope.enableSecondaryAxe = function(axeCode) {
      var idx = $scope.chartConfig.yAxisVariables.indexOf(axeCode);

      if (idx === -1) {
        if ($scope.chartConfig.yAxisVariables.length >= maxYAxisVariableCount) {
          $scope.chartConfig.yAxisVariables.pop();
        }
        $scope.chartConfig.yAxisVariables.push(axeCode);
      } else {
        $scope.chartConfig.yAxisVariables.splice(idx, 1);
      }

      $scope.$emit("chartConfigChanged");
    };

    $scope.canUseAsPrimaryAxis = function(axeCode) {
      return (ChartUtil.isXAxisMain($scope.chartConfig.type) ?
        ChartUtil.canUseAsXAxis :
        ChartUtil.canUseAsYAxis)(
        axeCode,
        $scope.chartConfig.type,
        $scope.dataset.data[axeCode]
      );
    };

    $scope.canUseAsSecondaryAxis = function(axeCode) {
      return (ChartUtil.isXAxisMain($scope.chartConfig.type) ?
        ChartUtil.canUseAsYAxis :
        ChartUtil.canUseAsXAxis)(
        axeCode,
        $scope.chartConfig.type,
        $scope.dataset.data[axeCode]
      );
    };

    $scope.mainAxisTitle = function() {
      return ChartUtil.isXAxisMain($scope.chartConfig.type) ? "AXE X" : "AXE Y";
    };

    $scope.secondaryAxisTitle = function() {
      return ChartUtil.isXAxisMain($scope.chartConfig.type) ? "AXE Y" : "AXE X";
    };

    ///**
    // * change Xaxis
    // * @param axeCode
    // */
    $scope.changeMainAxis = function(axeCode) {
      $scope.chartConfig.xAxisVariable = axeCode;
      $scope.$emit("chartConfigChanged");
    };

    $scope.changeColoring = function(axeCode) {
      $scope.chartConfig.coloringVariable = axeCode;
      $scope.$emit("chartConfigChanged");
    };

    $scope.needXAxis = function() {
      return $scope.chartConfig.type == "boxplot";
    };
  }
]);
