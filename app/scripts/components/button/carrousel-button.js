/**
 * Created by Michael DESIGAUD on 07/09/2015.
 */
'use strict';

angular
  .module("chuvApp.components.button")
  .directive("carrousselButton", function() {
    return {
      replace: true,
      template: '<a href="" ng-click="onClick({event:$event})" class="{{class}}"><i class="{{iconClass}}"></i></a>',
      restrict: "E",
      scope: {
        class: "@",
        onClick: "&",
        iconClass: "@"
      }
    };
  });
