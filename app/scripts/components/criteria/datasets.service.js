/**
 * Created by Manuel Spuher on 01/10/17
 */
"use strict";

angular.module("chuvApp.components.criteria").factory("Dataset", [
  "$resource",
  "backendUrl",
  function($resource, backendUrl) {
    // var resource = $resource(backendUrl + "/datasets");
    var resource = ["CHUV", "CHRU", "ADNI", "PPMI"];
    return resource;
  }
]);
