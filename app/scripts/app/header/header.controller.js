/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
"use strict";

angular.module("chuvApp.header").controller("HeaderController", [
  "$scope",
  "$translate",
  "$translatePartialLoader",
  "$state",
  "tmhDynamicLocale",
  "User",
  "Config",
  // "$rootScope",
  // "$http",
  // "backendUrl",
  function(
    $scope,
    $translate,
    $translatePartialLoader,
    $state,
    tmhDynamicLocale,
    User,
    Config /*,
    $rootScope, // TODO: vars aren't used, commented to jshint warning detection
    $http,
    backendUrl*/
  ) {
    $translatePartialLoader.addPart("header");
    $translate.refresh();

    /**
       * Change language event
       * @param lang new lang
       */
    $scope.onChangeLanguage = function(lang) {
      $translate.use(lang);
      tmhDynamicLocale.set(lang);
    };

    /**
       * Is current language
       * @param languageKey language key
       * @return {boolean} true if language is the same
       */
    $scope.isCurrentLanguage = function(languageKey) {
      return $translate.use() === languageKey;
    };

    /**
       * Search method event
       */
    $scope.search = function() {
      $state.go("search");
    };

    $scope.logout = function() {
      if ($state.current.name !== "intro") {
        $state.go("intro");
      }

      User.logout();
    };

    Config.then(function(config) {
      $scope.name = config.instanceName;
    });

    $scope.go_to_review = function() {
      console.log("switch_to_v3");
      window.location.href = "/review";
    };
  }
]);
