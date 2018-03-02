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
        var png = {
          generate  : function () {
            html2canvas(element[0], {}).then(function(canvas) {
              // If browser supports - download via virtual link click
              // If it doesn't - append an img
              if ( document.createElement && document.createEvent ) {
                //Creating new link node.
                var gUrl = canvas.toDataURL('image/png');
                var link = document.createElement('a');
                link.href = gUrl;
                link.setAttribute('target','_blank');

                if (link.download !== undefined) {
                  //Set HTML5 download attribute. This will prevent file from opening if supported.
                  var preFileName = gUrl.substring(gUrl.lastIndexOf('/') + 1, gUrl.length);
                  var fileName = ( preFileName.length < 12 ) ?
                    preFileName.substring(1, preFileName.length) + ".png" :
                    preFileName.substring(1, 12) + ".png";
                  link.download = fileName;
                }

                //Dispatching click event.
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
              } else {
                var imgWrapper = document.createElement('div');
                imgWrapper.className = "table-image-wraper";
                imgWrapper.innerHTML = "Your browser doesn't support auto-upload of images. Please save the" +
                  " image manually.";
                imgWrapper.appendChild( canvas );
                element.parent().append( imgWrapper );
              }

            });
          }
        };
        $parse(attrs.exportToPng).assign(scope.$parent, png);
      }
    }
  }
]);
