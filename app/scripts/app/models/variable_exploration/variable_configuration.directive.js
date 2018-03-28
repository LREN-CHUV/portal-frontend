"use strict";
angular.module("chuvApp.models").directive("variableConfiguration", function() {
  return {
    templateUrl: "scripts/app/models/variable_exploration/variable_configuration.html",
    scope: {
      setFocusedVariable: "=",
      setVariableSelectedAs: "=",
      getFocusedVariable: "=",
      configuration: "="
    },
    controller: [
      "$scope",
      "$location",
      "$timeout",
      function($scope, $location, $timeout) {
        $scope.do_configure = false;

        // configure panel starts hidden, and then reveals itself if needed.
        $timeout(function() {
          $scope.do_configure = !!$location.search().configure;
        });

        $scope.set_configure = function() {
          $scope.do_configure = true;
        };

        $scope.has_configuration = function() {
          return _.any(Object.keys($scope.configuration), function(sub_arr) {
            return Object.keys($scope.configuration[sub_arr]).length;
          });
        };

        $scope.get_button_label = function(type) {
          var focusedVariable = $scope.getFocusedVariable();
          var is_group = focusedVariable && !!focusedVariable.groups;
          var is_used_as =
            focusedVariable &&
            focusedVariable.code in $scope.configuration[type];

          var out = is_used_as ? "-" : "+";
          if (is_group) {
            out = out + " all";
          }
          return out + " as " + type;
        };
      }
    ]
  };
});
