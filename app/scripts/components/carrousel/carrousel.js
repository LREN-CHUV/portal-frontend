/**
 * Created by Michael DESIGAUD on 08/09/2015.
 */
angular.module('chuvApp.components.carrousel').directive("carrousel", [function () {
  return {
    replace: true,
    templateUrl: './scripts/components/carrousel/carrousel-template.html',
    restrict: 'E',
    scope: {
      items: '=',
      onChangeMine:'&'
    },
    link:function(scope,element){

      scope.loadCarrousel = function(){
        var $panel_article_search_widget = $(element);
        if($panel_article_search_widget.length){
          $panel_article_search_widget.width($panel_article_search_widget.parent().width());
          var panel_write_article_top_position = $(".panel-form-write-article").offset().top;
          if(panel_write_article_top_position-$(window).scrollTop() <=100){
            $panel_article_search_widget.css("top",100);
          }else{
            $panel_article_search_widget.css("top",panel_write_article_top_position-$(window).scrollTop());
          }
          $panel_article_search_widget.css("bottom","65px");
        }

        var $searchResume = $('.container-ee-search-resume');
        var $listSearch = $searchResume.find('.search-list'),
          $wrapperListSearch = $listSearch.find(".wrapper-search-list");
        var wList = 0;
        $wrapperListSearch.find('a').each(function() {
          wList += $(this).outerWidth(true);
        });
        $wrapperListSearch.css({
          width : wList
        });
      };

      scope.onClickBtnDown = function(event){
        var $element = $(".search-list ul");
        var list_height =  parseFloat($element.height());
        var list_top = parseFloat($element.css('top'));
        var container_height = parseFloat($(".search-list").height());

        if( (list_height+list_top-200) > container_height ){
          $element.css("top",(list_top-200)+"px");
          $('.carrousel-up').removeClass("hide");
        }else{
          $element.css("top",(container_height-list_height)+"px");
          $(event.currentTarget).addClass("hide");
        }
      };

      scope.onClickBtnUp = function(event){
        var $element = $(".search-list ul");
        var list_top = parseFloat($element.css('top'))

        if( list_top+200 < 0 ){
          $element.css("top",(list_top+200)+"px");
          $('.carrousel-down').removeClass("hide");
        }else{
          $element.css("top","0px");
          $(event.currentTarget).addClass("hide");
        }
      };

      scope.loadCarrousel();

    }
  };
}]);

angular.module('chuvApp.components.carrousel').directive("carrouselChart", ['ChartUtil', 'Model','backendUrl','$compile','$templateRequest','$q', '$timeout', function (ChartUtil, Model,backendUrl,$compile,$templateRequest,$q, $timeout) {
  return {
    templateUrl: './scripts/components/carrousel/carrousel-chart.html',
    restrict: 'E',
    scope:{
      "model":"="
    },
    link:function(scope,element) {

      /**
       * @returns {boolean} is the "model" an actual model (instead of an experiment
       */
      scope.is_model = function () {
        // if the "model" has a model, then it's an experiment
        return !scope.model.model;
      }

      /**
       * @returns {boolean} is the "model" an experiment
       */
      scope.is_experiment = function () {
        // if the "model" has a model, then it's an experiment
        return !!scope.model.model;
      }

      scope.get_drag_data = function() {
        if (scope.is_model)
          return '<img src="' + scope.largeSvg + '"><br><a href="' + location.origin + '/models/' + scope.model.slug + '/">' + scope.model.title + '</a>';
        return '<table></table>';
      }

      $q.all([Model.get({slug:scope.model.slug}).$promise,$templateRequest("./scripts/app/articles/article-table.html")]).then(function(data){

        var config = angular.copy(scope.model.config);
        config.height = 200;
        config.title = {text: ''};
        config.width = element.parent().width();
        scope.config = ChartUtil(config, scope.model.dataset);

        $timeout(
          function () {
            var chart = _.find(
              Highcharts.charts,
              function (chart) {
                if (!chart) return false;
                return $(chart.renderTo).parents().index(element[0]) >= 0;
              }
            )
            if (!chart) return;
            scope.svg = "data:image/svg+xml," + encodeURIComponent(chart.getSVG());
            chart.userOptions.chart.width = chart.options.chart.width = chart.chartWidth = 700;
            chart.userOptions.chart.height = chart.options.chart.height = chart.chartHeight = 450;
            scope.largeSvg = "data:image/svg+xml," + encodeURIComponent(chart.getSVG());
          },
          100
        )
      });

    }
  };
}]);
