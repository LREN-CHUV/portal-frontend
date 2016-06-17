angular.module('chuvApp.experiments')
    .controller('NewExperimentController',[
      '$scope', 'MLUtils', '$stateParams', 'Model', '$location', '$modal', function($scope, MLUtils, $stateParams, Model, $location, $modal) {
        $scope.loaded = false;
        $scope.parseInt = parseInt;

        $scope.ml_methods = [];
        $scope.shared = {
          chosen_method: null,
          method_parameters: [],
          cross_validation: true,
          experiment_configuration: []
        };
        $scope.help_is_open = true;

        $scope.type_name = function (method_name) {
          return method_name.charAt(0).toUpperCase() + method_name.slice(1) + "s";
        };

        // Get all the ml methods
        MLUtils.list_ml_methods().$promise.then(
            function (data) {
              $scope.ml_methods = data;
            }
        );

        // Check if the method can be applied to the model
        function disable_method (method) {

          if (method.disable) {
            return true;
          }

          // Check constraints
          if (method.constraints) {

            // Input constraints
            if (method.constraints.variable) {
              if (!method.constraints.variable[$scope.predicting_type]) {
                return true;
              }
            }

            // Covariable constraints
            var cov_nb = 0;
            var grp_nb = 0;
            if (method.constraints.covariables) {

              var cov_nb = $scope.dataset.header.length;

              if (method.constraints.covariables.min_count && cov_nb < method.constraints.covariables.min_count) {
                return true;
              }

              if (method.constraints.covariables.max_count && cov_nb < method.constraints.covariables.max_count) {
                return true;
              }
            }

            // Grouping constraints
            if (method.constraints.grouping) {

              var grp_nb = $scope.dataset.grouping.length;

              if (method.constraints.grouping.min_count && grp_nb < method.constraints.grouping.min_count) {
                return true;
              }

              if (method.constraints.grouping.max_count && grp_nb > method.constraints.grouping.max_count) {
                return true;
              }
            }

            if (grp_nb > 0 && cov_nb > 0 && !method.constraints.mixed) {
              return true;
            }
          }

          return false;
        }

        // function to be called when query and dataset are ready
        function on_data_loaded () {

          $scope.loaded = true;

          var variable_data = $scope.dataset.data[$scope.dataset.variable[0]];

          $scope.predicting_type = MLUtils.get_datatype($scope.dataset.variable[0], variable_data);

          $scope.ml_methods.forEach(function(method) {
            method.disable = disable_method(method);
          });

          // Open methods menu accordion
          $scope.accordion = {
            statistics: true,
            features_extraction: true,
            predictive_model: true
          };
        }


        if ($stateParams.model_slug) {
          // we have a slug: load model
          Model.get({slug: $stateParams.model_slug}, function(result) {
            $scope.model = result;
            $scope.dataset = result.dataset;
            $scope.query = result.query;
            on_data_loaded();
          });

        } else {
          // load model from data

          // step 1: load query
          var search = $location.search();
          function map_query(category) {
            return search[category]
                ? search[category].split(",").map(function (code) { return {code: code}})
                : [];
          }

          $scope.query = {
            variables: map_query("variables"),
            groupings: map_query("groupings"),
            coVariables: map_query("coVariables"),
            filters: map_query("filters"),
            textQuery: search.query
          };

          // step 2: load dataset
          var query = angular.copy($scope.query);

          Model.executeQuery(query).success(function (queryResult) {
            $scope.loading_model = false;
            $scope.dataset = queryResult;
            on_data_loaded();
          });

          $scope.save_model = function (callback) {
            // pass

            $modal.open({
              templateUrl: "/scripts/app/experiments/save-model-modal.html",
              controller: ['$scope', '$state', function (child_scope, $state) {
                child_scope.do_save_model = function() {

                  $scope.model = {
                    title: child_scope.name,
                    config: {
                      type: 'designmatrix',
                      height: 480,
                      yAxisVariables: $scope.dataset.header.slice(0, 5),
                      xAxisVariable: null,
                      title: {text: child_scope.name }
                    },
                    dataset: $scope.dataset,
                    valid: child_scope.share,
                    query: $scope.query
                  };

                  // save new model
                  Model.save($scope.model, function (model) {
                    //$state.go('experiment', {model_slug: model.slug}); //TODO To be removed?
                    //TODO Add a notification service...
                    //notifications.error("The model was successfully saved!");
                    alert("Save ok");
                    child_scope.$close();
                  }, function(){
                    // TODO Add a notification service...
                    //notifications.error("An error occurred when trying to save the model!");
                    alert("Error on save!");
                    child_scope.$dismiss();
                  });
                };
              }]
            })

          }
        }

        /**
         * Checks whether this method has already been added to the experiment with this
         * set of parameters.
         * @returns {boolean}
         */
        $scope.method_already_configured = function () {
          var method_idx, chosen_parameter_idx, other_parameter_idx, method;

          return _.any(
              $scope.shared.experiment_configuration,
              function (method) {

                return method.code == $scope.shared.chosen_method.code && _.all(
                        $scope.shared.method_parameters,
                        function (chosen_parameter) {

                          return _.any(
                              method.parameters,
                              function (other_parameter) {

                                return other_parameter.code == chosen_parameter.code && chosen_parameter.value == other_parameter.value

                              }
                          )
                        }
                    )
              }
          )
        };

        /**
         * Returns whether the current configuration is valid
         * @returns {boolean}
         */
        $scope.configuration_not_valid = function() {
          var chosen_parameter_idx;

          for (chosen_parameter_idx = 0; chosen_parameter_idx < $scope.shared.method_parameters.length; chosen_parameter_idx++) {
            if (!$scope.shared.method_parameters[chosen_parameter_idx].value) {
              return true;
            }
          }

          return false;
        };

        $scope.add_to_experiment = function () {

          var name = $scope.shared.chosen_method.label;
          if ($scope.shared.method_parameters && $scope.shared.method_parameters.length) {
            name += " with " + $scope.shared.method_parameters.map(function (parameter, index) {
                  return parameter.label
                      + '='
                      + parameter.value
                      + (index !== $scope.shared.method_parameters.length - 1 ? ", " : "");
                });
          }

          var method_to_be_added = {
            code: $scope.shared.chosen_method.code,
            name: name,
            parameters: $scope.shared.method_parameters.map(function (param) { return { code: param.code, value: param.value }})
          };

          var is_predictive_model = $scope.shared.chosen_method.type.indexOf("predictive_model") >= 0;

          if ($scope.shared.cross_validation && is_predictive_model) {
            $scope.shared.experiment_configuration.push(method_to_be_added);
          } else {
            $scope.shared.experiment_configuration = [method_to_be_added];
          }

          $scope.shared.cross_validation = is_predictive_model;
        };
      }])
    .controller('ExperimentDetailsController', ['$stateParams', '$state', 'MLUtils', '$scope', '$timeout', 'User', function ($stateParams, $state, MLUtils, $scope, $timeout, User) {

      var refresh_rate = 2500; // ms
      var cancel_timeout;
      var cancelled = false;
      var is_waiting_for_finish = false;
      $scope.loading = true;
      $scope.model_slug = $stateParams.model_slug;

      function refresh_experiment_until_done () {
        if (!cancelled && !$scope.experiment.finished) {
          is_waiting_for_finish = true;
          cancel_timeout = $timeout(refresh_experiment_until_done, refresh_rate);
          get_experiment();
        }
      }

      function compute_aggregated_algorithms_comparison_hc_config() {

        $scope.aggregated_algorithms_comparison_hc_config = {
          "options": {
            "chart": {
              "type": "column"
            }
          },
          "series": $scope.result.map(function (experiment_result) {
            var validation_avg = experiment_result.data.cells.validations[0].data.average;
            return {
              name: experiment_result.name,
              data: [
                validation_avg.MSE,
                validation_avg.RMSE,
                validation_avg.R2,
                validation_avg.FAC2
              ],
              id: experiment_result.code
            }
          }),
          "title": {
            "text": "Algorithm result comparison"
          },
          "loading": false,
          "xAxis": {
            categories: ["Mean square error", "Root mean square error", "Coefficient of determination (R²)", "Fac2 fit ratio"]
          }
        };
        $scope.show_aggregated_algorithms_comparison = false;
        $timeout(function () {
          $scope.show_aggregated_algorithms_comparison = true;
        }, 100)
      }

      function get_experiment () {
        MLUtils.get_experiment($stateParams.experiment_uuid).then(
            function on_get_experiment_success (response) {
              if (cancelled) return;

              $scope.experiment = response.data;

              $scope.loading = false;

              if (!is_waiting_for_finish)
                refresh_experiment_until_done();

              if (!!$scope.experiment.finished && !$scope.experiment.resultsViewed)
                MLUtils.mark_as_read($scope.experiment);

              $scope.validations = JSON.parse($scope.experiment.validations);
              $scope.algorithms = JSON.parse($scope.experiment.algorithms);
              try {
                $scope.result = JSON.parse($scope.experiment.result);
                if ($scope.result)
                  compute_aggregated_algorithms_comparison_hc_config();
              } catch (e) {
                if (!($scope.experiment.hasError || $scope.experiment.hasServerError)) {
                  $scope.experiment.hasError = true;
                  $scope.experiment.result = "Invalid JSON: \n" + $scope.experiment.result;
                }
              } // pass

            },
            function on_get_experiment_fail (response) {
              if (cancelled) return;

              $scope.loading = false;
              $scope.experiment = {
                hasError: true,
                result: "This experiment doesn't exist",
                finished: true
              }
            }
        )
      }

      get_experiment();

      $scope.$on("$destroy", function () {
        if (cancel_timeout) {
          cancelled = true;
          $timeout.cancel(cancel_timeout);
        }
      });

      var user;
      $scope.sharing_working = false;
      User.get().then(function () { user = User.current(); });

      $scope.experiment_is_mine = function () {
        return $scope.experiment.createdBy.username === user.username;
      };

      $scope.mark_experiment_as_unshared = function () {
        $scope.sharing_working = true;
        MLUtils.mark_as_unshared($scope.experiment).then(function () {
          $scope.experiment.shared = false;
          $scope.sharing_working = false;
        }, function () {
          $scope.experiment.shared = true;
          $scope.sharing_working = false;
        });
      };
      $scope.mark_experiment_as_shared = function () {
        $scope.sharing_working = true;
        MLUtils.mark_as_shared($scope.experiment).then(function () {
          $scope.experiment.shared = true;
          $scope.sharing_working = false;
        }, function () {
          $scope.experiment.shared = false;
          $scope.sharing_working = false;
        });
      };

      $scope.variable_title = function (variable_code) {
        // capitalize
        return variable_code
            .split(/[ _\-]/)
            .map(function (code_part) { return code_part.replace(/^[a-z]/, function (str) {return str.toUpperCase(); })})
            .join(" ");
      };

      $scope.pvalue_quality = function (pvalue) {
        pvalue = Math.abs(pvalue);
        if (pvalue <= 0.001) return "(★★★)";
        if (pvalue <= 0.01) return "(★★)";
        if (pvalue <= 0.1) return "(★)";
        return "";
      };

    }]);
