/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';
angular.module('chuvApp.models').controller('ReviewController',['$scope','$translatePartialLoader','$translate','Model','$stateParams','ChartUtil',"$state",'$log','User','$location', '$modal', '$timeout', '$filter', 'Variable', 'Group',
  function($scope, $translatePartialLoader, $translate, Model, $stateParams, ChartUtil, $state, $log, User, $location, $modal, $timeout, $filter, Variable, Group) {

    var filterFilter = $filter("filter");

    $translatePartialLoader.addPart('model');
    $translate.refresh();

    $scope.model = {};
    $scope.query = {};
    $scope.dataset = {};

    $scope.chartConfig = {
      type: 'designmatrix',
      height: 480
    };

    //$scope.chartConfig = {
    //  options: {
    //    chart: {
    //      type: 'heatmap',
    //      zoomType: 'x'
    //    }
    //  },
    //  size: {
    //    height: 480
    //  },
    //  title:{},
    //  subtitle:{}
    //};

    /**
     * load model by slug
     * @param slug
     */
    $scope.load = function (slug) {
      Model.get({slug: slug}, function(result) {
        $scope.model = result;
        $scope.dataset = result.dataset;
        if($stateParams.isCopy === "true"){
          $scope.model.title = "Copy of "+$scope.model.title;
        }
        $scope.chartConfig.title.text = $scope.model.title;
        $scope.chartConfig.subtitle.text = $scope.model.description;
        $scope.chartConfig.options.chart.type = $scope.model.chart.chartType;
        $scope.chartConfig.xAxis = {code:$scope.model.chart.xAxis};
        $scope.chartConfig.series = _.map($scope.model.chart.chartConfigSets, function(o,idx) {
          var configSet = {};
          configSet.color = o.color;
          configSet.name = o.label;
          configSet.code = o.code;
          return configSet;
        });
        $scope.$emit('event:loadModel',result);
        $scope.$emit('event:searchSuccess',ChartUtil.toChartData($scope.chartConfig,result.dataset));
        $scope.executeBtnAnimate();
        $scope.executed = true;
      });
    };

    if ($stateParams.slug !== undefined) {
      $scope.load($stateParams.slug);
    }


    /**
     * Return true if object has been created by current user
     * @param obj
     * @returns {boolean}
     */
    $scope.isMine = function (obj) {
      return obj.id == null || obj.createdBy.id == User.current().id;
    };

    /**
     * save or update model
     */
    $scope.saveModel = function() {
      $scope.model.chart = {chartType: $scope.chartConfig.options.chart.type};
      $scope.model.chart.xAxis = $scope.chartConfig.xAxis.code;
      $scope.model.chart.svg = $scope.chartConfig.getHighcharts().getSVG();
      $scope.model.chart.chartConfigSets = _.map($scope.chartConfig.series, function (o) {
        var configSet = {};
        configSet.color = o.color;
        configSet.label = o.name;
        configSet.code = o.code;
        return configSet;
      });

      $scope.model.dataset = {code: $scope.dataset.code};
      $scope.model.query = $scope.query;

      $scope.model.title = $scope.chartConfig.title.text;
      $scope.model.description = $scope.chartConfig.subtitle.text;

      if ($scope.model.slug == null) {
        // save new model
        Model.save($scope.model, function (model) {
          $state.go('models-edit', {slug: model.slug});
          alert("Save ok");
        },function(){
          alert("Error on save!");
        });
      } else {
        // save existing model
        Model.update({slug: $scope.model.slug}, $scope.model, function (model) {
          $state.go('models-edit', {slug: model.slug});
          alert("Save ok");
        },function(){
          alert("Error on save!");
        });
      }
    };

    /**
     * Execute animation
     */
    $scope.executeBtnAnimate = function () {
      var searchHelpSelector = '.search-help-container';
      var searchResultSelector = '.search-result';
      var tl = new TimelineMax({ paused: true, onComplete: function () {
        TweenMax.set($(searchHelpSelector), { position: 'absolute'});
        TweenMax.set($(searchResultSelector), { position: 'relative', left: 0, x: 0, y: 0 });
      } });
      tl.fromTo($(searchHelpSelector), 0.3, { scale: 1 }, { scale: 0.8 })
        .fromTo($(searchHelpSelector), 0.3, {  autoAlpha: 1, x: '0%' }, { autoAlpha: 0, x: '40%' })
        .fromTo($(searchResultSelector), 0.3, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 });

      tl.play();
    };

    /**
     * check if list contains value
     * @param list
     * @param value
     * @returns {boolean}
     */
    $scope.contains = function (list, value) {
      var findFunction = function (item) {
        return angular.equals(item, value)
      };

      return _.find(list, findFunction) !== undefined;
    };

    /**
     * Returns a promise that resolves when filterQuery is set.
     */
    $scope.configureFilterQuery = function () {
      var childScope = $scope.$new();

      var modal = $modal.open({
        templateUrl: 'scripts/app/models/review/filter-query-modal.html',
        scope: childScope,
        size: 'lg',
        controller: function () {
          childScope.contructQB = function () {

            var filterVariables = $scope.query.filters
              .concat($scope.query.coVariables)
              .concat($scope.query.groupings)
              .map(function (variable) {
                variable = $scope.allVariables[variable.code];
                return {
                  id: variable.code,
                  label: variable.label,
                  type: 'double',
                  operators: ['equal', 'not_equal', 'less', 'greater', 'between', 'not_between']
                }
              });

            $(".query-builder").queryBuilder({
              plugins: ['bt-tooltip-errors'],
              filters: filterVariables,
              allow_empty: true,
              inputs_separator: " - ",
              rules: $scope.query.filterQuery,
              icons: {
                add_group: "ti ti-plus",
                add_rule: "ti ti-plus",
                remove_group: "ti ti-close",
                remove_rule: "ti ti-close",
                error: "ti ti-na"
              }
            });
          };

          childScope.validateQuery = function () {
            var qb = $(".query-builder");
            if(qb.queryBuilder('validate')) {
              $scope.query.filterQuery = qb.queryBuilder('getRules');
              // ok this is not to be used in the DB, but is intented as a textual representation
              $scope.query.textQuery = qb.queryBuilder('getSQL', false, false).sql;
              qb.queryBuilder('destroy');
              modal.close();
            }
          }
        }
      });

      // do not unwrap this: childScope.contructQB is set later.
      modal.opened.then(function () {
        $timeout(
          childScope.contructQB,
          300
        )
      });
      return modal.result;
    };

    $scope.executeQuery = function () {
      $scope.query.filters.length && !$scope.query.filterQuery
        ? $scope.configureFilterQuery().then(doExecuteQuery)
        : doExecuteQuery();
    };

    /**
     *
     * @param model
     */
    $scope.loadResources = function (model) {
      if ($stateParams.slug !== undefined) {
        //$scope.initDesign();
      }

      Variable.query()
        .$promise.then(function (allVariables) {
          allVariables = _.sortBy(allVariables,"label");
          $scope.variables = filterFilter(allVariables, {isVariable: true});
          $scope.groupingVariables = filterFilter(allVariables, {isGrouping: true});
          $scope.coVariables = filterFilter(allVariables, {isCovariable: true});
          $scope.filterVariables = filterFilter(allVariables, {isFilter: true});

          $scope.allVariables = _.indexBy(allVariables, 'code');
          return Group.get().$promise;
        })
        .then(function (group) {
          $scope.groups = group.groups;
          _.extend($scope.query, model.query);
          if ($stateParams.slug === undefined) {
            //$scope.initDesign();
          }
        });
    };

    /**
     * Execute a search query
     */
    function doExecuteQuery() {
      var query = angular.copy($scope.query);
      //check query
      var error = "";
      //The query must have at less a Variable, a Grouping and a Covariable to be sent to the API.
      if (query.variables.length < 1) {
        error += "The query must have at less a Variable.\n";
      }
      if (query.groupings.length < 1) {
        error += "The query must have at less a Grouping.\n";
      }
      // check if grouping is complete
      if ($scope.contains(query.groupings, {code: undefined})) {
        error += "A grouping is not complete yet.\n";
      }

      if (query.coVariables.length < 1) {
        error += "The query must have at less a Covariable.\n";
      }
      // check if coVariables is complete
      if ($scope.contains(query.coVariables, {code: undefined})) {
        error += "A covariable is not complete yet.\n";
      }

      // check if filter is complete
      if ($scope.contains(query.filters, {operator: '', values: []})) {
        error += "A filter is not complete yet.\n";
      }
      if (error.length > 0) {
        alert(error);
        return;
      }

      $scope.loading_model = true;

      Model.executeQuery(query).success(function (queryResult) {
        $scope.executeBtnAnimate();
        $scope.executed = true;
        var chartData = ChartUtil.toChartData($scope.chartConfig, queryResult);
        $scope.dataset = chartData.dataset;
        $log.debug("Generating chart with config:", $scope.chartConfig);
        $scope.$emit('event:searchSuccess', chartData);
        var chart = $scope.chartConfig.getHighcharts();
        if (chart) {
          for (var i = 0; i < chart.series.length; i++) {
            chart.series[i].show();
          }
        }
        $scope.loading_model = false;
      });
    }

    if ($location.search().execute) {

      // wait for data to be there before executing query.
      var watchOnce = $scope.$watchGroup(
        ["query.variables", "query.groupings", "query.coVariables", "variables"],
        function (newValue) {
          if (!_.all(newValue)) return;

          // unbind watch
          watchOnce();

          $scope.executeQuery();
        }
      );

    }

    /**
     * programmatically redirects to the review model, with the current model.
     */
    $scope.go_to_explore = function () {
      var should_configure = $scope.query.variables &&
        $scope.query.groupings &&
        $scope.query.coVariables &&
        $scope.query.filters &&
        ($scope.query.variables.length ||
        $scope.query.groupings.length ||
        $scope.query.filters.length ||
        $scope.query.coVariables.length);

      if (!should_configure) {
        return $location.url("/explore")
      }

      function unmap_category(category) {
        return $scope.query[category]
          .map(function (variable) { return variable.code; })
          .join(",");
      }

      var query = {
        variable: unmap_category("variables"),
        covariable: unmap_category("coVariables"),
        grouping: unmap_category("groupings"),
        filter: unmap_category("filters")
      };

      $location.url(
        "/explore?configure=true&"
        + Object.keys(query).map(function (category) {
          return category + "=" + query[category]
        }).join("&"));
    };


  }
]);
