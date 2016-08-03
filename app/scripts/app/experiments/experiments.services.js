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

      function compute_classifier_accuracy(matrix) {
        var i, j, fc = 0, sum = 0;
        for(i = 0; i < matrix.length; i++) {
          fc += matrix[i][i];
          for(j = 0; j < matrix.length; j++) {
            sum += matrix[i][j];
          }
        }

        return fc / sum;
      }

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
          return $http.get(backendUrl + "/experiments/mine?maxResultCount=" + (max_result_count || 50));
        },
        list_available_experiments: function (max_result_count) {
          return $http.get(backendUrl + "/experiments?maxResultCount=" + (max_result_count || 50));
        },
        get_display_type: function (result) {

          switch (result.code) {
            case "linearRegression":
              return "linearRegression";
              break;
            case "anova":
              return "anova";
              break;
            default: // Check if cross-validation and prediction type
              if (result.data.cells.validations && result.data.cells.validations.length) {
                if (result.data.cells.validations[0].data.average.hasOwnProperty("R2")) {
                  return "regression";
                }
                return "classification";
              } else {
                return "unknown";
              }
          }
        },
        CV: {
          real: {
            compute_series: function (result) {
              result.map(function (method_result) {

                if (method_result.data.cells.validations && method_result.data.cells.validations.length > 0) {
                  var validation_avg = method_result.data.cells.validations[0].data.average;
                  return {
                    name: method_result.name,
                    data: [
                      validation_avg.MSE,
                      validation_avg.RMSE,
                      validation_avg.R2,
                      validation_avg.FAC2
                    ],
                    id: method_result.code
                  }
                }
              })
            },
            compute_legend: function () {
              return {
                categories: ["Mean square error", "Root mean square error", "Coefficient of determination (R²)", "Fac2 fit ratio"]
              }
            }
          },
          binominal: {
            compute_series: function (result) {
              result.map(function (method_result) {

                if (method_result.data.cells.validations && method_result.data.cells.validations.length > 0) {
                  var cm = method_result.data.cells.validations[0].data.average.confusion_matrix;
                  return {
                    name: method_result.name,
                    data: [
                      compute_classifier_accuracy(cm),
                      cm[0][0] / (cm[0][0] + cm[0][1]),
                      cm[0][0] / (cm[0][0] + cm[1][0]),
                      cm[1][1] / (cm[1][1] + cm[1][0])
                    ],
                    id: method_result.code
                  }
                }
              })
            },
            compute_legend: function () {
              return {
                categories: ["Accuracy", "Precision", "Sensitivity", "Specificity"]
              }
            }
          },
          polynominal: {
            compute_series: function (result) {
              result.map(function (method_result) {

                if (method_result.data.cells.validations && method_result.data.cells.validations.length > 0) {
                  var confusion_matrix = method_result.data.cells.validations[0].data.average.confusion_matrix;
                  return {
                    name: method_result.name,
                    data: [
                      compute_classifier_accuracy(confusion_matrix)
                    ],
                    id: method_result.code
                  }
                }
              })
            },
            compute_legend: function () {
              return {
                categories: ["Accuracy"]
              }
            }
          }
        }
      };
      return MLUtils;
    }]);
