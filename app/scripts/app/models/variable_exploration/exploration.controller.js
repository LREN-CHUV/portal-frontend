/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

"use strict";
angular.module("chuvApp.models").controller("ExploreController", [
  "$scope",
  "$location",
  "$state",
  "$timeout",
  "Variable",
  "Group",
  function($scope, $location, $state, $timeout, Variable, Group) {
    function make_configuration(config_name) {
      var config = {},
        url_config = $location.search()[config_name],
        splitted_url_config,
        i;
      if (!url_config) {
        return config;
      }

      splitted_url_config = url_config.split(",");

      for (i = 0; i < splitted_url_config.length; i++) {
        if (splitted_url_config[i].length) {
          config[splitted_url_config[i]] = null;
        }
      }
      return config;
    }

    $scope.focused_variable = null;
    $scope.groups = null;
    $scope.allVariables = null;
    $scope.allDatasets = null;
    $scope.loaded = false;

    $scope.configuration = {
      variable: make_configuration("variable"),
      covariable: make_configuration("covariable"),
      grouping: make_configuration("grouping"),
      filter: make_configuration("filter"),
      trainingDatasets: make_configuration("trainingDatasets")
    };

    $scope.set_focused_variable = function(variable) {
      $scope.focused_variable = variable;
    };

    $scope.get_focused_variable = function() {
      return $scope.focused_variable;
    };

    $scope.use_variable_as = function(type, variable, dont_broadcast) {
      if (
        type === "covariable" &&
        ["polynominal", "binominal"].indexOf(variable.type) != -1
      ) {
        type = "grouping";
      }

      var config = $scope.configuration[type];

      if (!variable) {
        variable = $scope.focused_variable;
      }

      // if is group
      if (variable && !!variable.groups) {
        // recurse subgroups
        variable.groups.forEach(function(group) {
          $scope.use_variable_as(type, group, true);
        });

        // recurse variables
        _.chain($scope.allVariables)
          .filter(function(child_variable) {
            return child_variable.group.code === variable.code;
          })
          .forEach(function(child_variable) {
            $scope.use_variable_as(type, child_variable, true);
          });
      } else {
        if (variable.code in config) {
          delete config[variable.code];
        } else {
          if (type == "variable") {
            config = $scope.configuration[type] = {};
          }
          // remove from all other configuration
          Object.keys($scope.configuration).forEach(function(var_config) {
            if (variable.code in $scope.configuration[var_config]) {
              delete $scope.configuration[var_config][variable.code];
            }
          });
          config[variable.code] = variable;
        }
      }

      if (!dont_broadcast) {
        $scope.$broadcast("configurationChanged");
      }
    };

    $scope.variable_is_used_as = function(type, variable) {
      if (!variable) {
        variable = $scope.focused_variable.code;
      }
      return variable in $scope.configuration[type];
    };

    /**
     * Returns whether the configuration is valid for going to the next step (review).
     */
    $scope.has_valid_configuration = function() {
      return (
        Object.keys($scope.configuration.variable).length > 0 &&
        Object.keys($scope.configuration.grouping).length +
          Object.keys($scope.configuration.covariable).length >=
          0
      );
    };

    /**
     * programmatically redirects to the review model, with the current model.
     */
    $scope.go_to_review = function() {
      $location.url(
        "/review?execute=true&" +
          Object.keys($scope.configuration)
            .map(function(category) {
              return (
                category +
                "=" +
                Object.keys($scope.configuration[category]).join(",")
              );
            })
            .join("&") +
          "&filterQuery" +
          $location.search().filterQuery
      );
    };

    var config_keys = Object.keys($scope.configuration);

    Variable.query()
      .$promise.then(function(allVariables) {
        $scope.allVariables = _.sortBy(allVariables, "label")
          // TODO For the moment we do not make available variable of type 'text' (Visit ID, etc)
          .filter(function(variable) {
            return (
              variable.group &&
              variable.group.code &&
              ["real", "integer", "polynominal", "binominal"].indexOf(
                variable.type
              ) != -1
            );
          });

        $scope.allVariables.forEach(function(variable) {
          config_keys.forEach(function(config_name) {
            if (variable.code in $scope.configuration[config_name]) {
              $scope.configuration[config_name][variable.code] = variable;
            }
          });
        });

        return Group.get().$promise;
      })
      .then(group => {
        // Do not display no-group groupdatasets
        $scope.groups = group.groups.filter(function(g) {
          return g.code !== "no-group";
        });
        $scope.loaded = true;

        return Variable.datasets();
      })
      .then(data => {
        $scope.allDatasets = data;
        if (!$location.search()["trainingDatasets"]) {
          data.map(function(curVal) {
            return ($scope.configuration.trainingDatasets[curVal.code] = null);
          });
          $scope.$broadcast("event:setToURLtrainingDatasets", data);
        }
      })
      .catch(e => {
        console.log(e);
      });

    $scope.$watch(
      "configuration",
      function(newVal, oldVal) {
        _.each(newVal, (obj, key) => {
          if (!angular.equals(newVal[key], oldVal[key])) {
            $location.search(key, Object.keys(newVal[key]).join(","));
          }
        });
      },
      true
    );
  }
]);
