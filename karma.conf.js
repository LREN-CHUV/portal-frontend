/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-08-11 using
// generator-karma 0.9.0


// Application's main directories constants
var appConfig = require("./app-config.json");
// Application's application scripts directories
var appScripts = require("./scripts-app");
// Application's vendor scripts directories
var vendorScripts = require("./scripts-vendor");
// Application's vendor styles directories

var testFiles = vendorScripts
  .concat(["./node_modules/angular-mocks/angular-mocks.js"])
  .concat(appScripts)
  .concat([
    "./" + appConfig.app + "/tests/**/*.test.js",
    "./" + appConfig.app + "/scripts/**/*.html"
  ]);

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
    files: testFiles,

    // list of files / patterns to exclude
    exclude: [
      "app/tests/e2e/**",
      "app/tests/app/requests/**",
      // "app/tests/app/models/variable_select.test.js",
      // "app/tests/app/header/header.controller.test.js",
      "app/scripts/external/**"
    ],

    preprocessors: {
      "app/scripts/**/*.js": ["babel"],
      "app/**/*.html": ["ng-html2js"]
    },

    babelPreprocessor: {
      options: {
        presets: ["es2015"],
        sourceMap: "inline"
      }
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
    // reporters: ["junit", "dots", "coverage"],
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
    // plugins: [
    //   "karma-phantomjs-launcher",
    //   "karma-jasmine",
    //   "karma-junit-reporter",
    //   "karma-coverage",
    //   "karma-ng-html2js-preprocessor"
    // ],

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
