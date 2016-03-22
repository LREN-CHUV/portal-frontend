/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models')
  .controller('ConfigurationController',['$scope','$rootScope','ChartUtil',function($scope,$rootScope,ChartUtil) {

    // backup of the axis configuration when switching to boxplot
    var axisConfiguration;

    $scope.changeGraphType = function(type){
      if (type == 'boxplot') {
        axisConfiguration = {
          x: angular.copy($scope.chartConfig.xAxisVariable),
          y: angular.copy($scope.chartConfig.yAxisVariables)
        };
        $scope.chartConfig.yAxisVariables = _.filter(
          $scope.chartConfig.yAxisVariables,
          function (variableCode) {
            return ChartUtil.canUseAsXAxis(variableCode, 'boxplot', $scope.dataset.data[variableCode]);
          }
        );
      } else if ($scope.chartConfig.type == 'boxplot') {
        $scope.chartConfig.xAxisVariable = axisConfiguration.x;
        $scope.chartConfig.yAxisVariables = axisConfiguration.y;
      }
      $scope.chartConfig.type = type;
      $scope.$emit("chartConfigChanged");
    };

    $scope.enableSecondaryAxe = function(axeCode) {
      var idx = $scope.chartConfig.yAxisVariables.indexOf(axeCode);

      if (idx === -1) {
        $scope.chartConfig.yAxisVariables.push(axeCode);
      } else {
        $scope.chartConfig.yAxisVariables.splice(idx, 1);
      }

      $scope.$emit("chartConfigChanged");
    };

    $scope.canUseAsPrimaryAxis = function (axeCode) {
      return (ChartUtil.isXAxisMain($scope.chartConfig.type)
        ? ChartUtil.canUseAsXAxis
        : ChartUtil.canUseAsYAxis)(
        axeCode, $scope.chartConfig.type, $scope.dataset.data[axeCode]
      );
    };

    $scope.canUseAsSecondaryAxis = function (axeCode) {
      return (ChartUtil.isXAxisMain($scope.chartConfig.type)
        ? ChartUtil.canUseAsYAxis
        : ChartUtil.canUseAsXAxis)(
        axeCode, $scope.chartConfig.type, $scope.dataset.data[axeCode]
      );
    };

    $scope.mainAxisTitle = function () {
      return ChartUtil.isXAxisMain($scope.chartConfig.type) ? 'AXE X' : "AXE Y";
    };

    $scope.secondaryAxisTitle = function () {
      return ChartUtil.isXAxisMain($scope.chartConfig.type) ? "AXE Y" : 'AXE X';
    };


    ///**
    // * change Xaxis
    // * @param axeCode
    // */
    $scope.changeMainAxis = function(axeCode){
      $scope.chartConfig.xAxisVariable = axeCode;
      $scope.$emit("chartConfigChanged");
    };

  }]);
