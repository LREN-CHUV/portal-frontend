"use strict";

/**
 *
 * {
 "id": 6,
 "title": "my title",
 "slug": "my-title-4",
 "abstract": "my resume",
 "content": "my content",
 "tags": [],
 "created_at": "2015-08-26T18:10:19+0200",
 "updated_at": "2015-08-26T18:10:19+0200",
 "created_by": "admin",
 "updated_by": "admin"
}
 */

/**
 * @ngdoc overview
 * @name frontendApp
 * @description
 * # frontendApp
 *
 * Main module of the application.
 */
angular
  .module("chuvApp", [
    "ngAnimate",
    "ngCookies",
    "ngResource",
    "ngRoute",
    "ngSanitize",
    "ngTouch",
    "pascalprecht.translate",
    "textAngular",
    "tmh.dynamicLocale",
    "angularMoment",
    "ui.select",
    "ui.bootstrap",
    "app.config",
    "utf8-base64",
    "btford.markdown",
    "xeditable",
    //components
    "chuvApp.components.filters",
    "chuvApp.components.criteria",
    //ui modules
    "chuvApp.header",
    "chuvApp.footer",
    "chuvApp.home",
    "chuvApp.hbpapps",
    "chuvApp.articles",
    "chuvApp.users",
    "chuvApp.requests",
    "chuvApp.models",
    "chuvApp.util",
    "chuvApp.components.header",
    "chuvApp.components.button",
    "chuvApp.components.checkbox",
    "chuvApp.components.carrousel",
    "chuvApp.components.scrollbar",
    "chuvApp.components.widget",
    "chuvApp.mydata",
    "chuvApp.profile",
    "chuvApp.experiments",
    "chuvApp.components.toolbar",
    "chuvApp.intro",
    // analytics
    "angulartics",
    "angulartics.google.analytics"
  ])
  .config([
    "$translateProvider",
    "tmhDynamicLocaleProvider",
    function($translateProvider, tmhDynamicLocaleProvider) {
      $translateProvider.useLoader("$translatePartialLoader", {
        urlTemplate: "i18n/{lang}/{part}.json"
      });

      $translateProvider.preferredLanguage("en");
      $translateProvider.fallbackLanguage("en");

      $translateProvider.useCookieStorage("NG_TRANSLATE_LANG_KEY");
      $translateProvider.useSanitizeValueStrategy("escaped");

      tmhDynamicLocaleProvider.localeLocationPattern(
        "i18n/angular-locale_{{locale}}.js"
      );
      tmhDynamicLocaleProvider.useCookieStorage("NG_TRANSLATE_LANG_KEY");

      // set global configuration highcharts
      /*
      Highcharts.setOptions({
        exporting: {
          chartOptions: {
            // specific options for the exported image
            plotOptions: {
              series: {
                dataLabels: {
                  enabled: false
                }
              }
            }
          },
          scale: 3,
          fallbackToExportServer: false
        }
      });
      */
    }
  ])
  .run([
    "$rootScope",
    "$uibModal",
    function($rootScope, $uibModal) {
      $rootScope.$on("$stateChangeStart", function() {
        $uibModal.dismissAll();
      });
    }
  ])
  .config([
    "$locationProvider",
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ])
  .run([
    "$state",
    "$location",
    "$translatePartialLoader",
    "$translate",
    "amMoment",
    "$rootScope",
    "backendUrl",
    "$cookies",
    "User",
    "editableOptions",
    function(
      $state,
      $location,
      $translatePartialLoader,
      $translate,
      amMoment,
      $rootScope,
      backendUrl,
      $cookies,
      User,
      editableOptions
    ) {
      $translatePartialLoader.addPart("common");
      $translate.refresh();
      amMoment.changeLocale("en");

      // if ($location.path() === "/") {
      $state.go("intro"); // FIXME, again
      // }

      $rootScope.getPdfUrl = function(slug) {
        return backendUrl + "/articles/" + slug + ".pdf";
      };

      User.get().then(function() {
        $rootScope.user = User.current();

        if (!User.hasAgreedTos()) {
          $state.go("tos_agreement");
        }
      });

      /**
       * Check if is a new visitor or not
       */
      $rootScope.isNewVisitor = function() {
        if (User.hasCurrent()) {
          return $cookies.get("intro-" + User.current().username) !== "hide";
        }
        return true;
      };

      /**
       * Check if user seems to be logged in
       */
      $rootScope.isLoggedIn = function() {
        return User.hasCurrent();
      };

      editableOptions.theme = "bs3";
      editableOptions.icon_set = "font-awesome"; // jshint ignore:line
    }
  ]);
