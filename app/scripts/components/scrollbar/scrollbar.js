/**
 * Created by Michael DESIGAUD on 07/09/2015.
 */
'use strict';

angular.module("chuvApp.components.scrollbar").directive("scrollbar", [
  function() {
    return {
      restrict: "A",
      link: function(scope, element) {
        $(element).mCustomScrollbar();
      }
    };
  }
]);
