/**
 * Created by Michael DESIGAUD on 11/08/2015.
 */
'use strict';

angular.module("chuvApp.home").config([
  "$stateProvider",
  function($stateProvider) {
    $stateProvider
      .state("home", {
        url: "/home",
        templateUrl: "scripts/app/home/home.html",
        controller: "HomeController"
      })
      .state("tos_agreement", {
        url: "/tos",
        templateUrl: "scripts/app/home/term-of-service.html",
        controller: "TosController"
      });
  }
]);
