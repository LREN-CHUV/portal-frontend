/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';
angular.module('chuvApp.models')
  .controller('ExploreController',['$scope', '$location', "$state", '$timeout', 'Variable', 'Group',
    function($scope, $location, $state, $timeout, Variable, Group){

      function make_configuration (config_name) {
        var config = {},
          url_config = $location.search()[config_name],
          splitted_url_config,
          i;
        if (!url_config) { return config; }

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
      $scope.loaded = false;

      $scope.configuration = {
        variable: make_configuration("variable"),
        covariable: make_configuration("covariable"),
        grouping: make_configuration("grouping"),
        filter: make_configuration("filter")
      };

      $scope.set_focused_variable = function (variable) {
        if (variable && variable.code)
          $scope.focused_variable = variable;
        else if (variable === false)
          $scope.focused_variable = null;
      };

      $scope.get_focused_variable = function () { return $scope.focused_variable; };


      $scope.use_variable_as = function(type, variable) {
        var config = $scope.configuration[type];

        if (!variable) {
          variable = $scope.focused_variable;
        }

        if (variable.code in config) {
          delete config[variable.code];
        } else {
          if (type == 'variable') {
            config = $scope.configuration[type] = {};
          }

          // remove from all other configuration
          Object.keys($scope.configuration).forEach(function (var_config) {
            if (variable.code in $scope.configuration[var_config]) {
              delete $scope.configuration[var_config][variable.code];
            }
          });
          config[variable.code] = variable;
        }

        $scope.$broadcast("configurationChanged");
      };


      $scope.variable_is_used_as = function (type, variable) {
        if (!variable) {
          variable = $scope.focused_variable.code;
        }
        return variable in $scope.configuration[type];
      };

      /**
       * Returns whether the configuration is valid for going to the next step (review).
       */
      $scope.has_valid_configuration = function () {
        return Object.keys($scope.configuration.variable).length > 0
          && Object.keys($scope.configuration.covariable).length > 0
          && Object.keys($scope.configuration.grouping).length > 0;
      };

      /**
       * programmatically redirects to the review model, with the current model.
       */
      $scope.go_to_review = function () {
        $location.url(
          "/review?execute=true&"
          + Object.keys($scope.configuration).map(function (category) {
            return category
              + "="
              + Object.keys($scope.configuration[category]).join(",");
          }).join("&")
        );
      };

      var config_keys = Object.keys($scope.configuration);

      Variable.query()
        .$promise.then(function (allVariables) {
          $scope.allVariables = _
            .sortBy(allVariables, "label")
            .filter(function (variable) { return variable.group && variable.group.code;});

          $scope.allVariables.forEach(function (variable) {
            config_keys.forEach(function (config_name) {
              if (variable.code in $scope.configuration[config_name])
                $scope.configuration[config_name][variable.code] = variable;
            });
          });

          return Group.get().$promise;
        })
        .then(function (group) {
          $scope.groups = group.groups;
          $scope.loaded = true;
        });

      config_keys.forEach(function (config_name) {
        $scope.$watch(
          function () {
            return Object.keys($scope.configuration[config_name]).length
          },
          function (picked_configuration_count) {
            if (picked_configuration_count) {
              $location.search(
                config_name,
                Object.keys($scope.configuration[config_name]).join(",")
              );
            } else {
              $location.search(config_name, undefined);
            }
          }
        )
      });
    }
  ]);
