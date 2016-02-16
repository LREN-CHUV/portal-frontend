/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';

angular.module('chuvApp.models').controller('ConfigurationController',['$scope','$rootScope','ChartUtil',function($scope,$rootScope,ChartUtil){

  //var currentColors = ChartUtil.getChartColor()['blue'];

  /**
   * Triggered when the search is successful and complete
   */
  $rootScope.$on('event:searchSuccess',function(){
    $scope.chartTypes = ['line','bar','column'];
    $scope.chartConfigCopy = angular.copy($scope.chartConfig);
  });

  /**
   * Change graph type
   * @param $event current click event
   * @param type new chart type
   */
  $scope.changeGraphType = function($event,type){
    if(type === "pie"){
      $scope.chartConfigCopy = angular.copy($scope.chartConfig);
      ChartUtil.buildPieChart($scope.chartConfig,$scope.dataset);
    } else if (type === "heatmap" ) {
      ChartUtil.buildDesignMatrix($scope.chartConfig,$scope.dataset);
    } else if ($scope.chartConfig.options.chart.type === "pie" ) {
      $scope.chartConfig.series = angular.copy($scope.chartConfigCopy.series);
      ChartUtil.buildStandardChart($scope.chartConfig,$scope.dataset);
    }

    $('.list-graphs').find('a').removeClass('active');
    $($event.currentTarget).addClass("active");
    $scope.chartConfig.options.chart.type = type;
  };

  /**
   * Show or hide a y axe
   * @param event current click event
   * @param axeCode current axe code
   */
  $scope.enableYAxe = function(event,axeCode) {
    var serie = _.find($scope.chartConfig.series, {code: axeCode});
    if (serie) {
      $scope.chartConfig.series = _.without($scope.chartConfig.series, serie);
    } else {
      var configSet = {code: axeCode, name: axeCode, visible: true};
      $scope.chartConfig.series.push(configSet);
    }

    var series = [];
    angular.forEach($scope.dataset.header,function(header){
      var foundSerie = _.findWhere($scope.chartConfig.series,{code:header});
      if(foundSerie) {
        series.push(foundSerie);
      }
    });
    $scope.chartConfig.series = series;

    if ($scope.chartConfig.options.chart.type === "pie") {
      ChartUtil.buildPieChart($scope.chartConfig, $scope.dataset);
    } else if ($scope.chartConfig.options.chart.type === "heatmap") {
      ChartUtil.buildDesignMatrix($scope.chartConfig, $scope.dataset);
    } else {
      ChartUtil.buildStandardChart($scope.chartConfig,$scope.dataset);
      $scope.chartConfigCopy = angular.copy($scope.chartConfig);
    }
  };


  /**
   * change Xaxis
   * @param axeCode
   */
  $scope.changeXaxis = function(axeCode){
    $scope.chartConfig.xAxis.code = axeCode;
    if ($scope.chartConfig.options.chart.type === "pie"){
      ChartUtil.buildPieChart($scope.chartConfig,$scope.dataset);
    } else if ($scope.chartConfig.options.chart.type === "heatmap") {
      ChartUtil.buildDesignMatrix($scope.chartConfig, $scope.dataset);
    } else {
      ChartUtil.buildStandardChart($scope.chartConfig,$scope.dataset);
      $scope.chartConfigCopy = angular.copy($scope.chartConfig);
    }
  };

  /**
   * get set config by code
   * @param axeCode
   * @returns {*}
   */
  $scope.getSeriesByCode = function(axeCode){
    return $scope.chartConfig.options.chart.type === "heatmap" ?
      ($scope.chartConfig.xAxis.categories.indexOf(axeCode) !== -1 ? $scope.chartConfig.series[0] : undefined) :
      _.find($scope.chartConfig.series,{code:axeCode});
  };

}]);
