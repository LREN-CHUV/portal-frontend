/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-08-11 using
// generator-karma 0.9.0

module.exports = function(config) {
  "use strict";
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: "./",

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ["jasmine"],

    // list of files / patterns to load in the browser
    files: [
      // Vendor js files
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
      "./node_modules/tinymce/tinymce.js",
      "./node_modules/angular-ui-tinymce/src/tinymce.js",
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
      "./app/styles/plugins/themify-icons/ie7/ie7.js",
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
      "./node_modules/showdown/src/options.js",
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
      ".app/styles/plugins/wijets/wijets.js",
      //Always load modules first
      "app/scripts/app/app.js",
      "app/scripts/**/*module.js",
      "app/scripts/**/*.js",
      //Load tests
      "app/tests/**/*.js",

      // load templates for preprocessing
      "app/scripts/**/*.html"
    ],

    // list of files / patterns to exclude
    exclude: [
      "app/tests/e2e/**",
      "app/tests/app/requests/**",
      "app/tests/app/models/variable_select.test.js",
      "app/tests/app/header/header.controller.test.js",
      "app/scripts/external/**"
    ],

    preprocessors: {
      "app/views/**/!(*test).js": "coverage",
      "app/**/*.html": "ng-html2js"
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: "app/",

      moduleName: "karmaTemplates"
    },

    // web server port
    port: 9999,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ["PhantomJS"],
    reporters: ["junit", "dots", "coverage"],
    junitReporter: {
      outputDir: "reports",
      outputFile: "test-results.xml"
    },
    coverageReporter: {
      type: "cobertura",
      dir: "reports/",
      file: "coverage-results.xml"
    },

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-junit-reporter",
      "karma-coverage",
      "karma-ng-html2js-preprocessor"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    // Uncomment the following lines if you are using grunt's server to run the tests

    // proxies: {

    //   '/': 'http://localhost:9000/'

    // },

    // URL root prevent conflicts with the site root

    // urlRoot: '_karma_'
  });
};
