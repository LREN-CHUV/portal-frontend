"use strict";
angular.module("chuvApp.models").directive("variableDescription", [
  function() {
    return {
      scope: {
        text: "="
      },
      template: "<p ng-repeat='paragraph in real_text'>{{paragraph}} <a ng-if='is_shortened && $index==real_text.length-1' ng-click='show_full()'>More</a></p>",
      controller: [
        "$scope",
        function($scope) {
          $scope.$watch("text", function(val) {
            if (!angular.isString(val)) {
              $scope.real_text = "";
              return;
            }

            if (val.length < 600) {
              $scope.real_text = val;
              $scope.is_shortened = false;
            } else {
              $scope.real_text = val.substr(0, 400) + "...";
              $scope.is_shortened = true;
            }
            $scope.real_text = $scope.real_text.split("\n");
          });

          $scope.show_full = function() {
            $scope.real_text = $scope.text.split("\n");
            $scope.is_shortened = false;
          };
        }
      ]
    };
  }
]);
