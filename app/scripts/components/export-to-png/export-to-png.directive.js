"use strict";

angular.module("chuvApp.components.exportToPng").directive("exportToPng", [
  '$parse',
  function(
    $parse,
  ) {
    return {
      restrict: "A",
      scope    : false,
      link     : function (scope, element, attrs) {
        var dataLink = "";
        var filename = "";
        var newLink = false;
        var png = {
          generate  : function () {
            html2canvas(element[0], {}).then(function(canvas) {
              if ( document.createElement && document.createEvent ) {
                //Creating new link node.
                var gUrl = canvas.toDataURL('image/png');
                dataLink = gUrl;

                var preFileName = gUrl.substring(gUrl.lastIndexOf('/') + 1, gUrl.length);
                filename = (preFileName.length < 12) ?
                  preFileName.substring(1, preFileName.length) + ".png" :
                  preFileName.substring(1, 12) + ".png";

                newLink = true;

                scope.$apply();
              } else {
                var imgWrapper = document.createElement('div');
                imgWrapper.className = "table-image-wraper";
                imgWrapper.innerHTML = "Your browser doesn't support auto-upload of images. Please save the" +
                  " image manually.";
                imgWrapper.appendChild( canvas );
                element.parent().append( imgWrapper );
              }
            });
          },
          link : function() {
            return dataLink;
          },
          name : function() {
            return filename;
          },
          ready : function() {
            return newLink;
          },
          hideLink : function() {
            newLink = false;
            return newLink;
          }
        };
        $parse(attrs.exportToPng).assign(scope.$parent, png);
      }
    }
  }
]);
