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
      return $http
        .get(backendUrl + "/variables/" + code + "/histogram_query.json")
        .then(function(response) {
          return $http.post(
            backendUrl + "/mining",
            JSON.stringify(response.data)
          );
        });
    };

    resource.getCustomHistogram = function(code, grouping, filters) {
      return $http
        .get(backendUrl + "/variables/" + code + "/histogram_query.json")
        .then(function(response) {
          var data = response.data;
          data.grouping = grouping ? grouping : data.grouping;
          data.filters = filters ? filters : data.filters;
          return $http.post(backendUrl + "/mining", JSON.stringify(data));
        });
    };

    resource.getStatistics = function(code) {
      return $http
        .get(backendUrl + "/variables/" + code + "/histogram_query.json")
        .then(function(response) {
          var data = response.data;
          data.grouping = [];
          data.algorithm = {
            code: "statisticsSummary",
            name: "Statistics Summary",
            parameters: [],
            validation: false
          };
          return $http.post(backendUrl + "/mining", JSON.stringify(data));
        });
    };

    return resource;
  }
]);
