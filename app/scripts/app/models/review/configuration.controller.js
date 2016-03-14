/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models')
  .controller('ConfigurationController',['$scope','$rootScope','ChartUtil',function($scope,$rootScope,ChartUtil) {

    $scope.changeGraphType = function(type){
      $scope.chartConfig.type = type;
      $scope.$emit("chartConfigChanged");
    };

    $scope.enableYAxe = function(axeCode) {
      if (!$scope.canUseAxis(axeCode)) return;

      var idx = $scope.chartConfig.yAxisVariables.indexOf(axeCode);

      if (idx === -1) {
        $scope.chartConfig.yAxisVariables.push(axeCode);
      } else {
        $scope.chartConfig.yAxisVariables.splice(idx, 1);
      }

      $scope.$emit("chartConfigChanged");
    };

    ///**
    // * change Xaxis
    // * @param axeCode
    // */
    $scope.changeXaxis = function(axeCode){
      $scope.chartConfig.xAxisVariable = axeCode;
      $scope.$emit("chartConfigChanged");
    };

  }]);
