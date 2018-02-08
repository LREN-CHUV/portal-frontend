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

    resource.getBreadcrumb = variableCode =>
      resource.hierarchy().then(
        data => {
          let found = false;
          return new Promise(resolve => {
            const breadcrumb = [];
            const iterate = current => {           
              let children = current.groups || current.variables;
              if (!children) {
                return;
              }

              breadcrumb.push(current.code);
              let foundNode = _.filter(children, (child) => child.code === variableCode);
              if (foundNode.length > 0){
                found = true;
                breadcrumb.push(foundNode[0].code);
                resolve(breadcrumb);
              }

              for (let i = 0, len = children.length; i < len; i++) {
                if (found) break;
                iterate(children[i]);
                if ((i === len - 1) && (!found)){
                  breadcrumb.pop();
                }
              }
            };

            iterate(data);
          })          
        }

      );

    resource.getData = variableCode =>
      resource.hierarchy().then(
        data =>
          new Promise(resolve => {
            // find variable in the tree
            const iterate = current => {
              let children = current.groups || current.variables;
              if (!children) {
                return;
              }

              if (children.map(c => c.code).includes(variableCode)) {
                const { code, label } = current;
                const self = children.find(c => c.code === variableCode);
                resolve({ self, parent: { code, label } });
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
