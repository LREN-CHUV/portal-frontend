/**
 * Created by David JAY on 07/09/2015.
 */
"use strict";

angular.module("chuvApp.components.criteria").factory("Variable", [
  "$resource",
  "backendUrl",
  "$http",
  "$cacheFactory",
  "$q",
  function($resource, backendUrl, $http, $cacheFactory, $q) {
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

    resource.datasets = () =>
      Promise.resolve([
        {
          code: "chuv",
          label: "CHUV"
        },
        {
          code: "adni",
          label: "ADNI"
        }
      ]);

    resource.hierarchy = function() {
      var hierarchy = cache.get("hierarchy");
      if (!angular.isUndefined(hierarchy)) {
        return $q.resolve(hierarchy);
      }

      return $http
        .get(backendUrl + "/variables/hierarchy")
        .then(function(response) {
          var data = response.data;

          return data;
        });
    };

    resource.getBreadcrumb = variableCode =>
      resource.hierarchy().then(data => {
        let found = false;
        const breadcrumb = [];
        const iterate = current => {
          let children = current.groups || current.variables;
          if (!children) {
            return [];
          }
          let len = _.has(current, "groups") ? current.groups.length : 0;
          breadcrumb.push({
            label: current.label,
            code: current.code,
            childsLength: len
          });
          let foundNode = _.filter(
            children,
            child => child.code === variableCode
          );
          if (foundNode.length) {
            found = true;
            let len = _.has(foundNode[0], "groups")
              ? foundNode[0].groups.length
              : 0;
            breadcrumb.push({
              label: foundNode[0].label,
              code: foundNode[0].code,
              childsLength: len
            });
          }

          for (let i = 0, len = children.length; i < len; i++) {
            if (found) break;
            iterate(children[i]);
            if (i === len - 1 && !found) {
              breadcrumb.pop();
            }
          }
        };

        iterate(data);
        return breadcrumb;
      });

    resource.getVariableData = variableCode =>
      resource.hierarchy().then(
        data =>
          new Promise(resolve => {
            // find variable in the tree
            const iterate = current => {
              const children = current.groups || current.variables;
              if (!children) {
                return;
              }

              if (children.map(c => c.code).includes(variableCode)) {
                const { code, label } = current;
                const data = children.find(c => c.code === variableCode);
                resolve({ data, parent: { code, label } });
              }

              for (let i of children) {
                iterate(i);
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
