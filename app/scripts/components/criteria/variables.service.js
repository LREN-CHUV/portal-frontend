/**
 * Created by David JAY on 07/09/2015.
 */
"use strict";

angular.module("chuvApp.components.criteria").factory("Variable", [
  "$resource",
  "backendUrl",
  "$http",
  function($resource, backendUrl, $http) {
    var resource = $resource(
      backendUrl + "/variables",
      {},
      {
        query: {
          cache: true,
          method: "GET",
          isArray: true
        }
      }
    );

    resource.get_stats = function(code) {
      return $http.get("/mocks/stats/" + code + ".json");
    };

    resource.get_histo = function(code) {
      var data = $http.get("/" + code + "/histogram_query.json");
      return $http.post(backendUrl + "/mining", data);
    };

    return resource;
  }
]);
