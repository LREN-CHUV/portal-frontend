"use strict";

angular.module("chuvApp.experiments").controller("NewExperimentController", [
  "$scope",
  "MLUtils",
  "$stateParams",
  "Model",
  "$location",
  "$uibModal",
  "notifications",
  "Config",
  "Variable",
  function(
    $scope,
    MLUtils,
    $stateParams,
    Model,
    $location,
    $uibModal,
    notifications,
    Config,
    Variable
  ) {
    $scope.loaded = false;
    $scope.parseInt = parseInt;

    $scope.ml_methods = [];
    $scope.datasets = [];

    $scope.shared = {
      chosen_method: null,
      method_parameters: [],
      cross_validation: false,
      experiment_configuration: [],
      experiment_datasets: {
        training: {},
        validation: {}
      },
      query: {}
    };

    $scope.help_is_open = true;
    Config.then(function(config) {
      $scope.federationmode = config.mode === "federation";
    });

    $scope.type_name = function(method_name) {
      return method_name.charAt(0).toUpperCase() + method_name.slice(1) + "s";
    };

    // $scope.switch_to_v3 = function(slug, uuid) {
    //   console.log("switch_to_v3");
    //   window.location.href = `/v3/experiment/${slug}/${uuid}`;
    // };

    // Get all the ml methods
    MLUtils.list_ml_methods().then(function(data) {
      $scope.ml_methods = data
        .filter(
          f => ($scope.federationmode ? true : f.environment !== "Exareme")
        )
        .filter(f => f.code !== "histograms" && f.code !== "statisticsSummary");
    });

    // Check if the method can be applied to the model
    function available_method(method) {
      if (method.disable) {
        return false;
      }

      // Check constraints
      if (method.constraints) {
        // Output constraints
        if (method.constraints.variable) {
          if (!method.constraints.variable[$scope.predicting_type]) {
            return false;
          }
        }

        // Covariable constraints
        var cov_nb = $scope.dataset.header.length;
        var grp_nb = $scope.dataset.grouping.length;

        if (method.constraints.covariables) {
          if (
            method.constraints.covariables.min_count &&
            cov_nb < method.constraints.covariables.min_count
          ) {
            return false;
          }

          if (
            method.constraints.covariables.max_count &&
            cov_nb > method.constraints.covariables.max_count
          ) {
            return false;
          }
        }

        // Grouping constraints
        if (method.constraints.grouping) {
          if (
            method.constraints.grouping.min_count &&
            grp_nb < method.constraints.grouping.min_count
          ) {
            return false;
          }
          if (
            method.constraints.grouping.max_count &&
            grp_nb > method.constraints.grouping.max_count
          ) {
            return false;
          }
        }
        if (grp_nb > 0 && cov_nb > 0 && !method.constraints.mixed) {
          return false;
        }
      }

      return true;
    }

    // function to be called when query and dataset are ready
    function on_data_loaded() {
      $scope.loaded = true;
      var variable_data = $scope.dataset.data[$scope.dataset.variable[0]];

      $scope.predicting_type = MLUtils.get_datatype(
        $scope.dataset.variable[0],
        variable_data
      );

      $scope.ml_methods.forEach(function(method) {
        method.available = available_method(method);
        method.experimental = method.maturity === "experimental";
        method.nyi = method.maturity === "coming_soon";
      });

      // Open methods menu accordion
      $scope.accordion = {
        statistics: true,
        features_extraction: true,
        predictive_model: true
      };
    }

    $scope.set_selected_method = function(method) {
      $scope.shared.chosen_method = method;
    };

    const fetchDatasetsAndUpdate = () =>
      Variable.datasets().then(data => {
        $scope.datasets = data;
        $scope.shared.experiment_datasets.training = $scope.query.trainingDatasets
          .map(d => d.code)
          .reduce((a, d) => {
            a[d] = true;
            return a;
          }, {});

        $scope.shared.experiment_datasets.validation = $scope.query.validationDatasets
          .map(d => d.code)
          .reduce((a, d) => {
            a[d] = true;

            return a;
          }, {});

        Object.keys($scope.query).forEach(k => {
          if ((_.has($scope.query, k), angular.isArray($scope.query[k])))
            $scope.shared.query[k] = $scope.query[k]
              .map(v => v.code)
              .join(", ");
        });
      });

    if ($stateParams.model_slug) {
      // we have a slug: load model
      Model.get({ slug: $stateParams.model_slug }, function(result) {
        $scope.model = result;
        $scope.dataset = result.dataset;
        $scope.query = result.query;
        fetchDatasetsAndUpdate();
        on_data_loaded();
      });

      $scope.model_slug = $stateParams.model_slug;
    } else {
      // load model from data

      // step 1: load query
      var search = $location.search();

      var map_query = function(category) {
        return search[category]
          ? search[category].split(",").map(function(code) {
              return { code: code };
            })
          : [];
      };

      $scope.query = {
        variables: map_query("variables"),
        groupings: map_query("groupings"),
        coVariables: map_query("coVariables"),
        filters: map_query("filters"),
        filterQuery: !_.isEmpty(search.filterQuery) ? search.filterQuery : "",
        trainingDatasets: map_query("trainingDatasets")
      };

      fetchDatasetsAndUpdate();

      // step 2: load dataset
      var query = angular.copy($scope.query);

      Model.executeQuery(query).then(function(response) {
        var queryResult = response.data;
        $scope.loading_model = false;
        $scope.dataset = queryResult;
        on_data_loaded();
      });
      $scope.save_model = function(callback) {
        // pass

        $uibModal.open({
          templateUrl: "/scripts/app/experiments/save-model-modal.html",
          controller: [
            "$scope",
            // "$state",
            function(child_scope /*, $state*/) {
              // TODO: var isn't used, commented to jshint warning detection
              child_scope.do_save_model = function() {
                var config = $stateParams.graph_config || {
                  type: "designmatrix",
                  height: 480,
                  yAxisVariables: $scope.dataset.header.slice(0, 5),
                  xAxisVariable: null
                };

                config.title = { text: child_scope.name };
                const training = $scope.shared.experiment_datasets.training;
                query.trainingDatasets = Object.keys(training)
                  .filter(k => training[k])
                  .map(t => ({ code: t }));

                const validation = $scope.shared.experiment_datasets.validation;
                query.validationDatasets = Object.keys(validation)
                  .filter(k => validation[k])
                  .map(t => ({ code: t }));

                if ($scope.query.filterQuery) {
                  query.filters = $scope.query.filterQuery;
                }
                delete query.filterQuery;

                $scope.model = {
                  title: child_scope.name,
                  config: config,
                  dataset: $scope.dataset,
                  valid: child_scope.share,
                  query: query
                };

                // save new model
                Model.save(
                  $scope.model,
                  function(result) {
                    $scope.model = result;
                    $scope.dataset = result.dataset;
                    $scope.query = result.query;

                    notifications.success("The model was successfully saved!");
                    child_scope.$close();
                    if (callback) {
                      callback();
                    }
                  },
                  function(error = {}) {
                    $scope.model = null;

                    const { data: { message } } = error;
                    notifications.error(
                      `An error occurred when trying to save the model! ${message}`
                    );
                    child_scope.$dismiss();
                  }
                );
              };
            }
          ]
        });
      };
    }

    /**
     * Checks whether this method has already been added to the experiment with this
     * set of parameters.
     * @returns {boolean}
     */
    $scope.method_already_configured = function() {
      /*var method_idx, chosen_parameter_idx, other_parameter_idx, method;*/ // TODO: vars aren't used, commented to jshint warning detection

      return _.any($scope.shared.experiment_configuration, function(method) {
        return (
          method.code == $scope.shared.chosen_method.code &&
          _.all($scope.shared.method_parameters, function(chosen_parameter) {
            return _.any(method.parameters, function(other_parameter) {
              return (
                other_parameter.code == chosen_parameter.code &&
                chosen_parameter.value == other_parameter.value
              );
            });
          })
        );
      });
    };

    /**
     * Returns whether the current configuration is valid
     * @returns {boolean}
     */
    $scope.configuration_valid = () =>
      // check for number (=== 0) or string value
      $scope.shared.method_parameters.every((v, index) => {
        if (
          $scope.shared.chosen_method.parameters[index].default_value.length ===
          0
        )
          return true; // no default_value means it's not mandatory
        return (
          (v.value || v.value === 0) &&
          (!isNaN(parseFloat(v.value)) || v.value.length)
        );
      });

    $scope.add_to_experiment = function() {
      var name = $scope.shared.chosen_method.label;
      const parameters =
        $scope.shared.method_parameters &&
        $scope.shared.method_parameters.length;

      if (parameters) {
        name +=
          " with" +
          $scope.shared.method_parameters.map(
            (parameter, index) => ` ${parameter.label}=${parameter.value}`
          );
      }

      var is_predictive_model =
        $scope.shared.chosen_method.type.indexOf("predictive_model") >= 0;

      var method_to_be_added = {
        code: $scope.shared.chosen_method.code,
        name: name,
        validation: is_predictive_model,
        parameters: $scope.shared.method_parameters.map(function(param) {
          const parsed = parseFloat(param.value);
          const value = isNaN(parsed) ? param.value : parsed;
          return { code: param.code, value: value };
        })
      };

      $scope.shared.experiment_configuration.push(method_to_be_added);
      $scope.shared.cross_validation |= is_predictive_model;
    };

    $scope.remove_from_experiment = function(index) {
      // If we remove a predictive model, check that we still require a validation
      if ($scope.shared.experiment_configuration[index].validation) {
        var predictive_models = $scope.shared.experiment_configuration.filter(
          function(m) {
            return m.validation;
          }
        );
        $scope.shared.cross_validation = !!(predictive_models.length - 1); // jshint ignore:line
      }

      $scope.shared.experiment_configuration.splice(index, 1);
    };

    // Display "Training and validation" only if predictive_model method selected
    $scope.show_training_validation = function(method) {
      $scope.shared.chosen_method = method;
      $scope.shared.method_parameters = [];
      $scope.isValidationShow = false;
      if (method.type == "predictive_model" && $scope.federationmode) {
        $scope.isValidationShow = true;
      }
    };

    $scope.modelsList = {};
    Model.getList({ own: true }).then(function(result) {
      $scope.modelsList = result.data;
      $scope.selectedModel = $scope.modelsList[$scope.modelsList.length - 1];
    });

    $scope.change = function(selectedModel) {
      Model.get({ slug: selectedModel.slug }, function(result) {
        $scope.model = result;
        $scope.dataset = result.dataset;
        $scope.query = result.query;
        $scope.config = result.config;
        fetchDatasetsAndUpdate();
        on_data_loaded();
      });
    };

    $scope.$watch(
      "shared.experiment_datasets.training",
      () => {
        if (!_.isEmpty($scope.shared.experiment_datasets.training)) {
          $scope.model.query.trainingDatasets = Object.keys(
            $scope.shared.experiment_datasets.training
          ).filter(s => $scope.shared.experiment_datasets.training[s]);
        }
      },
      true
    );

    $scope.$watch(
      "shared.experiment_datasets.validation",
      () => {
        if (!_.isEmpty($scope.shared.experiment_datasets.validation)) {
          $scope.model.query.validationDatasets = Object.keys(
            $scope.shared.experiment_datasets.validation
          ).filter(s => $scope.shared.experiment_datasets.validation[s]);
        }
      },
      true
    );
  }
]);
