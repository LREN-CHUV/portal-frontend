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
      $http
        .get(backendUrl + "/datasets")
        .then(response => response.data.map(d => ({ code: d })));

    resource.hierarchy = function() {
      var hierarchy = cache.get("hierarchy");
      if (!angular.isUndefined(hierarchy)) {
        return $q.resolve(hierarchy);
      }
      return $http
        .get(backendUrl + "/variables/hierarchy")
        .then(function(response) {
          var data = response.data;
          cache.put("hierarchy", data);
          return data;
        });
    };

    resource.getSubCategoryVariableCounter = variableCode =>
      resource.hierarchy().then(data => {
        const getCounts = group => {
          let out;
          if (group.groups) {
            out = _.map(group.groups, group => {
              return { code: group.code, counter: count(group) };
            });
          } else {
            out = [{ code: group.code, counter: group.variables.length }];
          }
          return out;
        };

        const count = (group, currentcount = 0) => {
          if (group.variables) {
            currentcount = currentcount + group.variables.length;
          }
          if (group.groups) {
            for (let i = 0; i < group.groups.length; i++) {
              currentcount = count(group.groups[i], currentcount);
            }
          }
          return currentcount;
        };
        const getGroup = (child, code) => {
          if (child.code === code) {
            return child;
          } else if (child.groups) {
            let out;
            for (let i = 0; i < child.groups.length; i++) {
              let group = getGroup(child.groups[i], code);
              if (group !== undefined) {
                out = group;
                break;
              }
            }
            return out;
          }
        };
        let currentGroup = variableCode ? getGroup(data, variableCode) : data;
        return currentGroup ? getCounts(currentGroup) : [];
      });

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

    resource.getVariableData = variableCode => {
      return resource.hierarchy().then(data => {
        let variableData = {}, found = false;
        const iterate = current => {
          //const children = current.groups || current.variables;
          const groups = current.groups || [];
          const variables = current.variables || [];
          /*if (!children) {
            return;
          }*/

          if (_.contains(variables.map(c => c.code), variableCode)) {
            const { code, label } = current;
            const data = _.find(variables, c => c.code === variableCode);
            found = true;
            variableData = { data, parent: { code, label } };
          }

          for (let i = 0, len = groups.length; i < len; i++) {
            if (found) break;
            iterate(groups[i]);
          }

          for (let i = 0, len = variables.length; i < len; i++) {
            if (found) break;
            iterate(variables[i]);
          }
        };

        if (!found) iterate(data);
        return variableData;
      });
    };
    resource.get_histo = function(code, datasets = [], filters = "") {
      return $http
        .get(backendUrl + "/variables/" + code + "/histogram_query.json")
        .then(function(response) {
          const data = response.data;
          data.datasets = datasets;
          data.filters = filters;
          return $http.post(backendUrl + "/mining", JSON.stringify(data));
        });
    };

    resource.getStatistics = function(code) {
      return $http
        .get(backendUrl + "/variables/" + code + "/histogram_query.json")
        .then(function(response) {
          var data = response.data;
          data.grouping = [];
          data.datasets = data.algorithm = {
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
