"use strict";

angular.module("chuvApp.util").factory("MLUtils", [
  "$http",
  "ChartUtil",
  "backendUrl",
  "$resource",
  function($http, ChartUtil, backendUrl, $resource) {
    var datatypes_per_code = {},
      ml_methods,
      ml_validations,
      ml_metrics /*,
      ml_methods_promise*/; // TODO: var isn't used, commented to jshint warning detection

    function map_experiment_for_backend(experiment) {
      function map_parameters_values_to_string(algo) {
        algo.parameters.forEach(function(parameter) {
          parameter.value = "" + parameter.value;
        });
      }

      experiment.algorithms.forEach(map_parameters_values_to_string);
      experiment.validations.forEach(function(validation) {
        map_parameters_values_to_string(validation);
        validation.name = "Untitled validation";
      });

      return experiment;
    }

    function compute_data_types(dataset) {
      var diff_count = _.uniq(dataset).length;
      if (diff_count > 10) {
        if (
          _.some(dataset, function(val) {
            return isNaN(+val);
          })
        ) {
          return "polynominal";
        }
        return "real";
      }

      return diff_count <= 2 ? "binominal" : "polynominal";
    }

    function get_uuid(experiment) {
      var uuid;
      if (angular.isObject(experiment)) {
        uuid = experiment.uuid;
      } else {
        uuid = experiment;
      }

      if (!angular.isString(uuid)) {
        return;
      }

      return uuid;
    }

    // TODO: add exareme methods to backend
    ml_methods = Promise.all([
      $resource(backendUrl + "/methods").get().$promise,
      $resource("/scripts/app/mock/exareme-methods.json").get().$promise
    ]).then(function(responses) {
      if (!responses.length) {
        return [];
      }

      var backendData = angular.fromJson(responses[0]);
      var staticData = angular.fromJson(responses[1]);

      ml_validations = backendData.validations; //[].concat(backendData.validations, staticData.validations)
      ml_metrics = backendData.metrics;

      return [].concat(backendData.algorithms, staticData.algorithms);
    });

    var MLUtils = {
      list_ml_methods: function() {
        return ml_methods;
      },
      list_validations: function() {
        return ml_validations;
      },
      list_metrics: function() {
        return ml_metrics;
      },
      get_datatype: function(code, dataArray) {
        if (!datatypes_per_code.hasOwnProperty(code)) {
          // TODO Use variable's meta-data instead!
          datatypes_per_code[code] = compute_data_types(dataArray);
        }
        return datatypes_per_code[code];
      },
      can_use_datatype_for_method_as_feature: function(/*datatype, method_name*/) {
        // TODO: arguments aren't used, commented to jshint warning detection
        // for now feature don't matter, everything is possible
        return true;
      },
      run_experiment: function(experiment) {
        return $http.post(
          backendUrl + "/experiments",
          map_experiment_for_backend(experiment)
        );
      },
      get_experiment: function(experiment_uuid) {
        return $http.get(backendUrl + "/experiments/" + experiment_uuid);
      },
      mark_as_read: function(experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) {
          return;
        }

        return $http.get(backendUrl + "/experiments/" + uuid + "/markAsViewed");
      },
      mark_as_shared: function(experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) {
          return;
        }

        return $http.get(backendUrl + "/experiments/" + uuid + "/markAsShared");
      },
      mark_as_unshared: function(experiment) {
        var uuid = get_uuid(experiment);
        if (!uuid) {
          return;
        }

        return $http.get(
          backendUrl + "/experiments/" + uuid + "/markAsUnshared"
        );
      },
      list_experiments: function(model_slug) {
        return $http.get(
          backendUrl + "/experiments?maxResultCount=0&slug=" + model_slug
        );
      },
      list_my_experiments: function() {
        return $http.get(backendUrl + "/experiments?mine=true");
      },
      list_available_experiments: function() {
        return $http.get(backendUrl + "/experiments");
      },
      get_display_type: function(result) {
        switch (result.code) {
          case "linearRegression":
            return "linearRegression";
          case "anova":
            return "anova";
          default:
            // Check if cross-validation and prediction type
            if (
              result.data &&
              result.data.cells &&
              result.data.cells.validations &&
              result.data.cells.validations.length
            ) {
              if (
                result.data.cells.validations[0].data.average.type ===
                "RegressionScore"
              ) {
                return "regression";
              }
              return "classification";
            } else {
              return "unknown";
            }
        }
      },
      parse_results: parse_results
    };

    // TODO Move in get_experiment
    /**
     *
     * Merge the metrics catalogue (meta data) with the actual results (data)
     *
     * @param data
     * @returns {{validations, algorithms, validation_type: *, methods: *, overview: Array, raw}}
     */
    function parse_results(results) {
      var overview = [], validation_type = null;

      // Prepare every algorithms output for display
      var methods = results.map(function(result) {
        var output = {
          type: MLUtils.get_display_type(result),
          name: result.name
        };

        // Update validation type
        if (
          !validation_type &&
          result.data &&
          result.data.cells &&
          result.data.cells.validations &&
          result.data.cells.validations.length &&
          (output.type === "regression" || output.type === "classification")
        ) {
          validation_type = output.type;
        }

        if (output.type === validation_type) {
          var i = 0;
          output.metrics = ml_metrics[output.type].map(function(metric) {
            var value =
              result.data.cells.validations[0].data.average[metric.code];

            if (metric.type === "numeric") {
              if (overview.length <= i) {
                overview.push({
                  data: [],
                  label: metric.label
                });
              }
              overview[i].data.push({ data: [value], name: result.name });
              i++;
            }

            return angular.extend({ value: value }, metric);
          });
        } else {
          output.raw = result;
        }

        return output;
      });

      return {
        validation_type: validation_type,
        methods: methods,
        overview: overview,
        raw: results
      };
    }

    return MLUtils;
  }
]);
