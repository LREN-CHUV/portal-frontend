/**
 * Created by David JAY on 07/09/2015.
 */
"use strict";

angular.module("chuvApp.components.criteria").factory("Variable", [
  "$resource",
  "backendUrl",
  "$http",
  "$cacheFactory",
  function($resource, backendUrl, $http, $cacheFactory) {
    var cache = $cacheFactory("hbp-sp8");

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

    resource.datasets = function() {
      return $http
        .get(backendUrl + "/variables/dataset")
        .then(function(response) {
          var data = response.data.enumerations;
          return data;
        });
    };

    resource.hierarchy = function() {
      var hierarchy = cache.get("hierarchy");
      if (!angular.isUndefined(hierarchy)) {
        return Promise.resolve(hierarchy);
      }

      return $http
        .get(backendUrl + "/variables/hierarchy")
        .then(function(response) {
          var data = response.data;

          if (!angular.isUndefined(data)) {
            cache.put("hierarchy", data);
          }

          return data;
        });
    };

    resource.parent = child =>
      resource.hierarchy().then(
        data =>
          new Promise(resolve => {
            const iterate = current => {
              let children = current.groups || current.variables;
              if (!children) {
                return;
              }

              if (children.map(c => c.code).includes(child.code)) {
                const { code, label } = current;
                resolve({ code, label });
              }

              for (let i = 0, len = children.length; i < len; i++) {
                iterate(children[i]);
              }
            };

            iterate(data);
          })
      );

    resource.mockup = function() {
      return $resource("/scripts/app/mock/variables.json").query();
    };

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
