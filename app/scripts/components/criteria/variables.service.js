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

    resource.get_histo = function(code) {
      return $http.get(backendUrl + "/variables/" + code + "/histogram_query.json")
      .success((data) => {
        return $http.post(backendUrl + "/mining", JSON.stringify(data));
      })
      .error((data, status, headers, config) => {
        $scope.error = true;
        return null
      });
    };

    return resource;
  }
]);
