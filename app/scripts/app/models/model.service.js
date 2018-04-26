/**
 * Created by Michael DESIGAUD on 31/08/2015.
 */
"use strict";

angular.module("chuvApp.models").factory("Model", [
  "$resource",
  "backendUrl",
  "$http",
  function($resource, backendUrl, $http) {
    var resource = $resource(
      backendUrl + "/models/:slug/:format",
      { slug: "@slug", format: "@format" },
      {
        update: {
          method: "PUT"
        },
        remove: {
          method: "DELETE"
        }
      }
    );

    resource.executeQuery = function(data) {
      //TODO Temporary solution. We need to pass JSON instead of SQL and parse it backend for security reasons.
      data.filters = data.textQuery;
      return $http.post(backendUrl + "/queries/requests.json", data);
    };

    /**
     * Runs the evaluation of
     * @param {string} estimation_model ex: "glr", "anv"
     * @param {Object} data the query
     * @returns {HttpPromise}
     */
    // TODO: estimation_model?
    resource.estimateQuery = function(estimation_model, data) {
      return $http.post(backendUrl + "/mining", data);
    };

    resource.mining = (data) => $http.post(backendUrl + "/mining", data);

    resource.getList = function(params) {
      return $http.get(backendUrl + "/models", { params: params });
    };

    resource.getSvg = function(slug) {
      return $http.get(backendUrl + "/models/" + slug + ".svg");
    };

    resource.copy = function(model) {
      return $http.post(
        backendUrl + "/models/" + model.slug + "/copies",
        model
      );
    };

    return resource;
  }
]);
