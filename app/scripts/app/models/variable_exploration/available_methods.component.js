"use strict";
angular.module("chuvApp.models").component("availableMethods", {
  bindings: {
    getFocusedVariable: "<",
    zoom: "="
  },
  require: {},
  controllerAs: "avmethods",
  controller: [
    "$scope",
    "Variable",
    "MLUtils",
    "Config",
    function($scope, Variable, MLUtils, Config) {
      var vm = this;

      var ml_all_methods = [];

      vm.ml_methods = [];
      vm.$onChanges = () => {
        // Get all the ml methods
        Config.then(config => config.mode === "local")
          .then(isLocal => {
            $scope.isLocal = isLocal;
          })
          .then(() => MLUtils.list_ml_methods())
          .then(function(data) {
            // FIXME Quick and dirty fix!
            if (!$scope.isLocal) {
              ml_all_methods = data.filter(function(m) {
                return m.environment !== "Exareme";
              });
            }
          });

        // TODO: just filters by local methods
        vm.ml_methods = true
          ? ml_all_methods.filter(function(m) {
              return m.code.substr(0, 3) !== "WP_";
            })
          : ml_all_methods.filter(function(m) {
              return m.code.substr(0, 3) === "WP_";
            });

        vm.ml_methods.forEach(function(method) {
          method.available = available_method(method);
          method.nyi = [
            "statisticsSummary",
            "svm",
            "randomforest",
            "gpr",
            "ffneuralnet"
          ].includes(method.code);
        });
      };

      // Check if the method can be applied to the model
      function available_method(method) {
        if (method.disable) {
          return false;
        }

        // Check constraints
        if (method.constraints) {
          // Output constraints
          if (method.constraints.variable) {
            if (!method.constraints.variable.real) {
              return false;
            }
          }

          if (method.constraints.covariables) {
            if (method.constraints.covariables.min_count) {
              return false;
            }

            if (method.constraints.covariables.max_count) {
              return false;
            }
          }

          // Grouping constraints
          if (method.constraints.grouping) {
            if (method.constraints.grouping.min_count) {
              return false;
            }

            if (method.constraints.grouping.max_count) {
              return false;
            }
          }
          if (!method.constraints.mixed) {
            return false;
          }
        }

        return true;
      }
    }
  ],
  templateUrl: "scripts/app/models/variable_exploration/available_methods.html"
});
