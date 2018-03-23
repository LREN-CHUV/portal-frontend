var appConfig = require("./app-config.json");

var vendorScripts = [
  "./node_modules/jquery/dist/jquery.js",
  "./node_modules/angular/angular.js",
  "./node_modules/bootstrap/dist/js/bootstrap.js",
  "./node_modules/angular-animate/angular-animate.js",
  "./node_modules/angular-cookies/angular-cookies.js",
  "./node_modules/angular-resource/angular-resource.js",
  "./node_modules/angular-route/angular-route.js",
  "./node_modules/angular-sanitize/angular-sanitize.js",
  "./node_modules/angular-touch/angular-touch.js",
  "./node_modules/angular-translate/dist/angular-translate.js",
  "./node_modules/angular-translate-loader-partial/angular-translate-loader-partial.js",
  "./node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.js",
  "./node_modules/angular-translate-storage-cookie/angular-translate-storage-cookie.js",
  "./node_modules/@uirouter/angularjs/release/angular-ui-router.js",
  "./node_modules/textangular/dist/textAngular-rangy.min.js",
  "./node_modules/textangular/dist/textAngular-sanitize.js",
  "./node_modules/textangular/dist/textAngular.js",
  "./node_modules/textangular/dist/textAngularSetup.js",
  "./node_modules/angular-xeditable/dist/js/xeditable.js",
  "./node_modules/highcharts/highstock.js",
  "./node_modules/highcharts/highcharts-more.js",
  "./node_modules/highcharts/modules/heatmap.js",
  "./node_modules/highcharts/modules/exporting.js",
  "./node_modules/highcharts/modules/data.js",
  "./node_modules/highcharts/modules/boost-canvas.js",
  "./node_modules/highcharts/modules/boost.js",
  "./node_modules/highcharts/modules/map.js",
  "./node_modules/highcharts-ng/dist/highcharts-ng.js",
  "./node_modules/underscore/underscore.js",
  "./node_modules/angular-dynamic-locale/src/tmhDynamicLocale.js",
  "./" + appConfig.app + "/styles/plugins/themify-icons/ie7/ie7.js",
  "./node_modules/moment/moment.js",
  "./node_modules/angular-moment/angular-moment.js",
  "./node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js",
  "./node_modules/javascript-detect-element-resize/jquery.resize.js",
  "./node_modules/d3/d3.js",
  "./node_modules/gsap/src/uncompressed/TweenMax.js",
  "./node_modules/icheck/icheck.min.js",
  "./node_modules/ui-select/dist/select.js",
  "./node_modules/gridster/dist/jquery.gridster.with-extras.min.js",
  "./node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js",
  "./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
  "./node_modules/angular-utf8-base64/angular-utf8-base64.js",
  "./node_modules/showdown/src/showdown.js",
  "./node_modules/angular-markdown-directive/markdown.js",
  "./node_modules/jQuery-QueryBuilder/dist/js/query-builder.standalone.js",
  "./node_modules/sql-parser/browser/sql-parser.js",
  "./node_modules/image-map-resizer/js/imageMapResizer.min.js",
  "./node_modules/angulartics/src/angulartics.js",
  "./node_modules/angulartics-google-analytics/lib/angulartics-ga.js",
  "./node_modules/jquery-ui/ucore.js",
  "./node_modules/jquery-ui/widget.js",
  "./node_modules/jquery-ui/mouse.js",
  "./node_modules/jquery-ui/sortable.js",
  "./node_modules/ng-table-to-csv/dist/ng-table-to-csv.js",
  "./node_modules/html2canvas/dist/html2canvas.js",
  "./" + appConfig.app + "/styles/plugins/wijets/wijets.js",
  "./app/scripts/components/highcharts/world.js"
];

module.exports = vendorScripts;
