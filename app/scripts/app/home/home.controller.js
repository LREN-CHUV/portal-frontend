/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
angular.module('chuvApp.home').controller('HomeController',['$scope','$translatePartialLoader','$translate','WidgetService','$rootScope','User','$cookies','Model','ChartUtil','$q','$http', 'backendUrl',
  function($scope,$translatePartialLoader,$translate,WidgetService,$rootScope,User,$cookies,Model,ChartUtil,$q,$http, backendUrl){

    $translatePartialLoader.addPart('home');
    $translatePartialLoader.addPart('articles');
    $translatePartialLoader.addPart('requests');
    $translate.refresh();

    /*$scope.datas = {
      scientists: 14,
      articles: 73,
      patients: 3721,
      teams: 126
    };*/

    $scope.models = [];

    /**
     * Search articles with current selected filters
     */
    $scope.init = function () {
        $http.get(backendUrl+'/user');
        $http.get(backendUrl+"/stats").success(
          function (response) {
            $scope.datas = response;
          }
        );
        var introTxtSelector = '.intro-txt';
        $scope.tlIntro = new TimelineMax({ paused : true });
        $scope.tlIntro .to($('.intro'), 0.6, { y : '-100%', scale : .4, autoAlpha : 0, ease : Power4.easeIn })
            .to($(introTxtSelector), 0.6, { y : '0%', scale : 1, autoAlpha : 1, ease : Power4.easeOut });

        $scope.tlIntro2 = new TimelineMax({ paused : true });
        $scope.tlIntro2.to($(introTxtSelector), 0.6, { y : '-100%', scale : .4, autoAlpha : 0, ease : Power4.easeIn }, 'start')
            .to($('.trigger-intro'), 0.3, { autoAlpha : 0 }, 'start')
            .to($('.trigger-close-intro'), 0.3, { autoAlpha : 0 }, 'start')
            .to($('.intro-container'), 0.2, { height: 0 }, '-=0.2');

      Model.getList({ limit:3, team:0, own:1}).then(function(response){
        if (!angular.isObject(response.data)) {
          return;
        }

        $scope.models = response.data;

        _.each($scope.models, function (model) {
          var config = angular.copy(model.config);
          config.height = 250;
          config.showLegend = false;
          model.chartConfig = ChartUtil(config, model.dataset);
        });
      });
    };

    //$scope.getModel = function(slug){
    //  var deferred = $q.defer();
    //  Model.get({slug:slug}).$promise.then(function(model){
    //  });
    //  return deferred.promise;
    //};

    $scope.gridsterOpts = {
        resizable: {
            enabled: false
        }
    };

    $scope.animateIntro = function(){
        if( !$scope.step2 ) {
            $scope.tlIntro.play();
            $scope.step2 = true;
        }
        else {
            $scope.tlIntro2.play();
          $scope.hideIntro();
        }
    };

    $scope.closePanel = function(event){
        $(event.currentTarget).fadeOut();
        TweenMax.to($('.intro'), 0.6, { y : '-100%', scale : .4, autoAlpha : 0, ease : Power4.easeIn });
        $scope.tlIntro2.play();
        $scope.hideIntro();
    };



    /**
     * Hide intro and store in cookie
     */
    $scope.hideIntro = function() {
      $cookies.put('intro-' + User.current().username, "hide");
    };

    // Init the controller values
    $scope.init();

  }]);
