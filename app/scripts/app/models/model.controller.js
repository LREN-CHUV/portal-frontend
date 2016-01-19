/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';
angular.module('chuvApp.models')
  .controller('ModelController',['$scope', '$location', 'Variable', 'Group',
    function($scope, $location, Variable, Group){

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
      // palette: http://paletton.com/#uid=70S1x0k5xw00-Uh2yIe9qrxedn8
      $scope.colors = {
        variable: "#FFEFD3",
        covariable: "#DEEDC4",
        grouping: "#D0ACBF",
        filter: "#8E98A9"
      };

      $scope.set_focused_variable = function (variable) {
        if (variable && variable.code)
          $scope.focused_variable = variable;
        else if (variable === false)
          $scope.focused_variable = null;
      };

      $scope.use_variable_as = function(type, variable) {
        var config = $scope.configuration[type];

        if (!variable) {
          variable = $scope.focused_variable;
        }

        if (variable.code in config) {
          delete config[variable.code];
        } else {
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

      Variable.query()
        .$promise.then(function (allVariables) {
          $scope.allVariables = _
            .sortBy(allVariables, "label")
            .filter(function (variable) { return variable.group && variable.group.code;});

        var config_keys = Object.keys($scope.configuration);
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
    }])
  .controller('ModelsController', ['$scope', '$translatePartialLoader', '$translate', '$rootScope', 'Model', 'backendUrl', '$attrs', 'WidgetService', 'User',
    function ($scope, $translatePartialLoader, $translate, $rootScope, Model, backendUrl, $attrs, WidgetService, User) {

      $translatePartialLoader.addPart('model');
      $translate.refresh();

      var params = {};
      if ($attrs.params !== undefined) {
        params = angular.fromJson($attrs.params);
      }

      $scope.getSvgUrl = function (model) {
        return backendUrl + "/models/" + model.slug + ".svg";
      };

      /**
       * Return true if object has been created by current user
       * @param obj
       * @returns {boolean}
       */
      $scope.isMine = function (obj) {
        return obj.createdBy.id == User.current().id;
      };

      Model.getList(params).then(function (response) {
        $scope.models = response.data;
        WidgetService.make();
      });
    }]);
