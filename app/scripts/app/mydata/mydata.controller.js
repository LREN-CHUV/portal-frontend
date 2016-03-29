/**
 * Created by Michael DESIGAUD on 08/09/2015.
 */
'use strict';

angular.module('chuvApp.mydata').controller('MyDataController', ['$scope', '$translatePartialLoader', '$translate','Article','backendUrl','Model','$q','ChartUtil','$timeout','ModalUtil','WidgetService','$stateParams','User',
  function ($scope, $translatePartialLoader, $translate,Article,backendUrl,Model,$q,ChartUtil,$timeout,ModalUtil,WidgetService,$stateParams,User) {
    $translatePartialLoader.addPart('mydata');
    $translate.refresh();

    $scope.rows = [];
    $scope.loaded = false;

    $scope.isMyDataScope = $stateParams.scope === "mydata";

    $scope.init = function(){
      var paramsArticle = {team:$scope.isMyDataScope ? 0 : 1, own:!$scope.isMyDataScope ? 0 : 1};
      if(!$scope.isMyDataScope){
        paramsArticle.status = "published";
      }

      var paramsModel = {team:$scope.isMyDataScope ? 0 : 1, own:!$scope.isMyDataScope ? 0 : 1};
      if(!$scope.isMyDataScope){
        paramsModel.valid = "1";
      }

      $q.all([Article.query(paramsArticle).$promise,
        Model.query(paramsModel).$promise]).then(function(data){
        var articles = data[0];
        var models = data[1];

        if(!models && articles){
          angular.forEach(articles,function(article){
            $scope.rows.push({type: 'A', data: article, size: 2, row: index + 1, col: 2});
          });
          $scope.loaded = true;
        } else {
          $q.all(
            _.map(models, function (model) { return $scope.getModel(model.slug) })
          ).then(function (modelsData) {
            $scope.loaded = true;
            _.chain(modelsData)
              .sortBy('createdAt')
              .reverse()
              .each(function (model, index) {
                $scope.rows.push({type: 'M', data: model, size: 1, row: index+1, col: 1, showChart: false});

                if(articles[index]) {
                  $scope.rows.push({type: 'A', data: articles[index], size: 2, row: index + 1, col: 2});
                }
              });
            $timeout(function () {
              _.each($scope.rows, function(row) {
                if (row.showChart === false)
                  row.showChart = true;
              })
            });

            if(articles.length > modelsData.length){
              angular.forEach(articles.slice(modelsData.length),function(article,index){
                $scope.rows.push({type: 'A', data: article, size: 2, row: index + 1, col: 2});
              });
            }
          });
        }
      });
    };

    $scope.getModel = function(slug){
      var deferred = $q.defer();
      Model.get({slug:slug}).$promise.then(function(model){
        var config = angular.copy(model.config);
        config.height = 300;
        config.showLegend = false;
        model.chartConfig = ChartUtil(config, model.dataset);
        deferred.resolve(model);
      });
      return deferred.promise;
    };

    $scope.init();

    /**
     * Return true if object has been created by current user
     * @param obj
     * @returns {boolean}
     */
    $scope.isMine = function(obj) {
      return obj.createdBy.username == User.current().username;
    };

    $scope.showArticleModal = function(article){
      ModalUtil.showModal($scope,article);
    };
  }]
);
