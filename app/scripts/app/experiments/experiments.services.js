angular.module('chuvApp.util')
  .factory('MLUtils', ['$http', 'ChartUtil', 'backendUrl', '$resource', function ($http, ChartUtil, backendUrl, $resource) {

    var datatypes_per_code = {},
      ml_methods,
      ml_validations,
      ml_methods_promise;

    function map_experiment_for_backend (experiment) {
      function map_parameters_values_to_string(algo) {
        algo.parameters.forEach(function (parameter) {
          parameter.value = "" + parameter.value;
        })
      }

      experiment.algorithms.forEach(map_parameters_values_to_string);
      experiment.validations.forEach(function (validation) {
        map_parameters_values_to_string(validation);
        validation.name = "Untitled validation";
      });

      return experiment;
    }

    function compute_data_types (dataset) {

      var diff_count = _.uniq(dataset).length;
      if (diff_count > 10) {

        if (_.any(function (val) { return isNaN(+val);})) {
          return "polynominal"
        }
        return "real"
      }

      return diff_count <= 2 ? "binominal" : "polynominal";

    }

    function get_uuid (experiment) {
        var uuid;
        if (angular.isObject(experiment))
          uuid = experiment.uuid;
        else
          uuid = experiment;

        if (!angular.isString(uuid))
          return;

      return uuid;
    }

    ml_methods = $resource(backendUrl + "/experiments/methods", {},
      { query : {
        transformResponse: [angular.fromJson, function (response) {
          return response.algorithms;
        }],
        isArray: true
      }}
    ).query();
    ml_validations = $resource(backendUrl + "/experiments/methods", {},
      { query : {
        transformResponse: [angular.fromJson, function (response) {
          return response.validations;
        }],
        isArray: true
      } }
    ).query();

    var MLUtils = {
      list_ml_methods: function () {
        return ml_methods;
      },
      list_validations: function () {
        return ml_validations;
      },
      get_datatype: function (code, dataArray) {
        if (!datatypes_per_code.hasOwnProperty(code)) {
          datatypes_per_code[code] = compute_data_types(dataArray);
        }
        return datatypes_per_code[code];
      },
      can_use_datatype_for_method_as_feature: function (datatype, method_name) {
        // for now feature don't matter, everything is possible
        return true;
      },
      run_experiment: function (experiment) {
        return $http.post(backendUrl + "/experiments", map_experiment_for_backend(experiment));
      },
      get_experiment: function (experiment_uuid) {
        return $http.get(backendUrl + "/experiments/" + experiment_uuid);
      },
      mark_as_read: function (experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) return;

        return $http.get(backendUrl + "/experiments/" + uuid + "/markAsViewed");
      },
      mark_as_shared: function (experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) return;

        return $http.get(backendUrl + "/experiments/" + uuid + "/markAsShared");
      },
      mark_as_unshared: function (experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) return;

        return $http.get(backendUrl + "/experiments/" + uuid + "/markAsUnshared");
      },
      list_experiments: function (model_slug) {
        return $http.get(backendUrl + "/experiments?maxResultCount=0&slug=" + model_slug);
      },
      list_my_experiments: function (max_result_count) {
        return $http.get(backendUrl + "/experiments/mine?maxResultCount=" + (max_result_count || 20));
      },
      list_available_experiments: function (max_result_count) {
        return $http.get(backendUrl + "/experiments?maxResultCount=" + (max_result_count || 20));
      },
    };
    return MLUtils;
  }]);
