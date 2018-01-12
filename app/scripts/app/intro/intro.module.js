'use strict';

angular
  .module(
    "chuvApp.intro",
    // Module requirements
    ["ngResource", "pascalprecht.translate", "ui.router"]
  )
  // Module configuration
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider.state("intro", {
        url: "/intro",
        templateUrl: "scripts/app/intro/intro.html",
        controller: "IntroController"
      });
    }
  ]);
