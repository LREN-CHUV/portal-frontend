/**
 * Created by Michael DESIGAUD on 12/08/2015.
 * Modified by Arnaud Jutzeler on 05/08/2016
 */

"use strict";
angular.module("chuvApp.models").controller("ReviewController", [
  "$scope",
  "$translatePartialLoader",
  "$translate",
  "Model",
  "$stateParams",
  "$state",
  "$log",
  "User",
  "$location",
  "$uibModal",
  "$timeout",
  "$filter",
  "Variable",
  "Group",
  "notifications",
  function(
    $scope,
    $translatePartialLoader,
    $translate,
    Model,
    $stateParams,
    $state,
    $log,
    User,
    $location,
    $uibModal,
    $timeout,
    $filter,
    Variable,
    Group,
    notifications
  ) {
    var filterFilter = $filter("filter");

    $translatePartialLoader.addPart("model");
    $translate.refresh();

    $scope.model = {};
    $scope.query = {};
    $scope.dataset = null;
    $scope.datasets = null; // sources of the data

    /**
     * load model by slug
     * @param slug
     */
    $scope.load = function(slug) {
      Model.get({ slug: slug }, function(result) {
        $scope.model = result;
        $scope.dataset = result.dataset;
        if ($stateParams.isCopy === "true") {
          $scope.model.title = "Copy of " + $scope.model.title;
        }
        $scope.query = result.query;

        $scope.$broadcast("event:loadModel", result);
        $scope.executeBtnAnimate();
        $scope.executed = true;
      });
    };

    if ($stateParams.slug !== undefined) {
      $scope.load($stateParams.slug);
    }

    /**
     * Return true if object has been created by current user
     * @returns {boolean}
     */
    $scope.isMine = function() {
      return (
        $scope.model.slug == null ||
        $scope.model.createdBy.username == User.current().username
      );
    };

    /**
     * Return true if the model has not been saved yet
     * @returns {boolean}
     */
    $scope.isNew = function() {
      return $scope.model.slug == null;
    };

    /**
     * save or update model
     */
    $scope.saveModel = function() {
      if (!$scope.model.title) {
        notifications.warning("You need a name for your model!");
        return;
      }

      $scope.model.config = $scope.chartConfig;
      $scope.model.dataset = $scope.dataset;
      $scope.model.query = angular.copy($scope.query); // will be modified, therefore we do a deep copy
      $scope.model.query.filters = $scope.filter;

      if ($scope.isNew()) {
        // save new model
        Model.save(
          $scope.model,
          function(model) {
            $state.go("models-edit", { slug: model.slug });
            notifications.success("The model was successfully saved!");
          },
          function() {
            notifications.error(
              "An error occurred when trying to save the model!"
            );
          }
        );
      } else {
        // if this model does not belong to the user
        if (!$scope.isMine()) {
          notifications.warning(
            "You cannot modify a model owned by someone else!"
          );
          return;
        }

        // save existing model
        Model.update(
          { slug: $scope.model.slug },
          $scope.model,
          function(model) {
            $state.go("models-edit", { slug: model.slug });
            notifications.success("The model was successfully updated!");
          },
          function() {
            notifications.error(
              "An error occurred when trying to update the model!"
            );
          }
        );
      }
    };

    /**
     * Execute animation
     */
    $scope.executeBtnAnimate = function() {
      var searchHelpSelector = $(".search-help-container");
      var searchResultSelector = $(".search-result");
      new TimelineMax({
        paused: true,
        onComplete: function() {
          TweenMax.set(searchHelpSelector, { position: "absolute" });
          TweenMax.set(searchResultSelector, {
            position: "relative",
            left: 0,
            x: 0,
            y: 0
          });
        }
      })
        .fromTo(searchHelpSelector, 0.3, { scale: 1 }, { scale: 0.8 })
        .fromTo(
          searchHelpSelector,
          0.3,
          { autoAlpha: 1, x: "0%" },
          { autoAlpha: 0, x: "40%" }
        )
        .fromTo(
          searchResultSelector,
          0.3,
          { scale: 0.8, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1 }
        )
        .play();
    };

    /**
     * check if list contains value
     * @param list
     * @param value
     * @returns {boolean}
     */
    $scope.contains = function(list, value) {
      var findFunction = function(item) {
        return angular.equals(item, value);
      };

      return _.find(list, findFunction) !== undefined;
    };

    var getFilterVariables = () =>
      $scope.query.filters
        .concat($scope.query.variables)
        .concat($scope.query.coVariables)
        .concat($scope.query.groupings)
        .map(function(variable) {
          variable = $scope.allVariables[variable.code];

          var var_config = {
            id: variable.code,
            label: variable.label,
            type: "double",
            operators: [
              "equal",
              "not_equal",
              "less",
              "greater",
              "between",
              "not_between"
            ]
          };

          if (variable.type === "integer") {
            var_config.type = "integer";
          } else if (variable.type !== "real") {
            var_config.type = "string";
            var_config.input = "select";
            var_config.operators = ["equal", "not_equal", "in", "not_in"];
            var_config.values = {};
            variable.enumerations.forEach(function(e /*, index*/) {
              // TODO: var isn't used, commented to jshint warning detection
              var_config.values[e.code] = e.label;
            });
          }

          return var_config;
        });

    $scope.getFilterVariables = () => getFilterVariables();

    /**
     * Returns a promise that resolves when filterQuery is set.
     */
    $scope.configureFilterQuery = function() {
      var childScope = $scope.$new();

      var modal = $uibModal.open({
        templateUrl: "scripts/app/models/review/filter-query-modal.html",
        scope: childScope,
        size: "lg",
        controller: function($uibModalInstance) {
          childScope.contructQB = function() {
            var filterVariables = getFilterVariables();
            if (!filterVariables.length) return;

            $(".query-builder").queryBuilder({
              plugins: ["bt-tooltip-errors"],
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

            if (!$scope.query.filterQuery && $scope.query.textQuery) {
              $(".query-builder").queryBuilder(
                "setRulesFromSQL",
                $scope.query.textQuery
              );
            }
          };

          childScope.validateQuery = function() {
            var qb = $(".query-builder");
            if (qb.queryBuilder("validate")) {
              $scope.query.filterQuery = qb.queryBuilder("getRules");
              // ok this is not to be used in the DB, but is intented as a textual representation
              $scope.query.textQuery = qb.queryBuilder(
                "getSQL",
                false,
                false
              ).sql;
              qb.queryBuilder("destroy");
              $uibModalInstance.close();
            }
          };
        }
      });

      $scope.$on("$stateChangeStart", $uibModal.dismiss);
      modal.result.then(() => {
        $scope.executeQuery;
        $scope.$broadcast("event:configureFilterQueryFinished");
      });

      // do not unwrap this: childScope.contructQB is set later.
      modal.opened.then(function() {
        $timeout(childScope.contructQB, 300);
      });

      return modal.result;
    };

    var axeCodeUsability = {};
    $scope.canUseAxis = function(isXAxis, axeCode) {
      // if boxplot and isYAxis or not boxplot and isXAxis
      if (isXAxis !== ($scope.chartConfig.type === "boxplot")) {
        if (!axeCodeUsability.hasOwnProperty(axeCode)) {
          axeCodeUsability[axeCode] = !_.any(
            $scope.dataset.data[axeCode],
            function(datapoint) {
              return !isFinite(datapoint);
            }
          );
        }
        return axeCodeUsability[axeCode];
      } else {
        return ChartUtil.canUseAsMainAxis(
          $scope.dataset.data[axeCode],
          $scope.chartConfig.type
        );
      }
    };

    /**
     *
     * @param model
     */
    $scope.loadResources = function(model) {
      Variable.query()
        .$promise.then(function(allVariables) {
          allVariables = _.sortBy(allVariables, "label");
          $scope.variables = filterFilter(allVariables, { isVariable: true });
          $scope.groupingVariables = allVariables.filter(function(v) {
            return ["polynominal", "binominal"].indexOf(v.type) != -1;
          });
          $scope.coVariables = allVariables.filter(function(v) {
            return ["real", "continuous"].indexOf(v.type) != -1;
          });
          $scope.filterVariables = filterFilter(allVariables, {
            isFilter: true
          });

          $scope.allVariables = _.indexBy(allVariables, "code");
          $scope.datasets = allVariables.find(function(v) {});

          return Group.get().$promise;
        })
        .then(function(group) {
          $scope.groups = group.groups;
          _.extend($scope.query, model.query);
        });
    };

    /**
     * Execute a search query
     */
    $scope.executeQuery = function doExecuteQuery() {
      var query = angular.copy($scope.query);
      //check query
      var error = "";
      //The query must have at less a Variable, a Grouping and a Covariable to be sent to the API.
      if (query.variables.length < 1) {
        error += "The query must have at least a Variable.\n";
      }
      // check if grouping is complete
      if ($scope.contains(query.groupings, { code: undefined })) {
        error += "A grouping is not complete yet.\n";
      }

      // check if coVariables is complete
      if ($scope.contains(query.coVariables, { code: undefined })) {
        error += "A covariable is not complete yet.\n";
      }

      // check if filter is complete
      if ($scope.contains(query.filters, { operator: "", values: [] })) {
        error += "A filter is not complete yet.\n";
      }
      if (error.length > 0) {
        notifications.error(error);
        return;
      }
    };

    if ($location.search().execute) {
      // wait for data to be there before executing query.
      var watchOnce = $scope.$watchGroup(
        [
          "query.variables",
          "query.groupings",
          "query.coVariables",
          "variables",
          "query.filterQuery"
        ],
        function(newValue) {
          if (!_.all(newValue)) {
            return;
          }

          // unbind watch
          watchOnce();

          $scope.executeQuery();
        }
      );
    }

    function update_location_search() {
      function unmap_category(category) {
        return (
          $scope.query[category] &&
          $scope.query[category]
            .map(function(variable) {
              return variable.code;
            })
            .join(",")
        );
      }

      var query = {
        variable: unmap_category("variables"),
        covariable: unmap_category("coVariables"),
        grouping: unmap_category("groupings"),
        filter: unmap_category("filters"),
        filterQuery: $scope.query.textQuery
          ? JSON.parse($scope.query.filterQuery)
          : null,
        execute: true
      };

      angular.forEach(query, function(val, key) {
        $location.search(key, val);
      });
    }

    /**
     * programmatically redirects to the review model, with the current model.
     */
    $scope.go_to_explore = function() {
      // TODO: Temporary solution. $scope.query.filters came as a string, while we work with it as an array
      if (!$scope.query.filters) {
        $scope.query.filters = [];
      }

      function unmap_category(category) {
        return $scope.query[category]
          .map(function(variable) {
            return variable.code;
          })
          .join(",");
      }

      var query = {
        variable: unmap_category("variables"),
        covariable: unmap_category("coVariables"),
        grouping: unmap_category("groupings"),
        filter: unmap_category("filters"),
        trainingDatasets: $location.search().trainingDatasets
      };

      if ($scope.query.filterQuery) {
        query.filterQuery = JSON.stringify($scope.query.filterQuery);
      }

      const url =
        "/explore?configure=true&" +
        Object.keys(query)
          .map(function(category) {
            return category + "=" + query[category];
          })
          .join("&");
      $location.url(url);
    };
  }
]);
