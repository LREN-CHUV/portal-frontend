"use strict";
angular
  .module("chuvApp.models")
  .component("availableMethods", {
    bindings: {
      getFocusedVariable: '<',
      zoom: '='
    },
    require: {
    },
    controllerAs: "avmethods",
    controller:[
      'Variable',
      "MLUtils",
      function(Variable, MLUtils){
        var vm = this;

        var ml_all_methods = [];

        vm.ml_methods = [];
        vm.$onChanges = () => {
          // Get all the ml methods
          MLUtils.list_ml_methods().then(function(data) {
            // FIXME Quick and dirty fix!
            ml_all_methods = data.filter(function(m) {
              return m.code !== "glm_exareme";
            });
          }).then(function() {
            // console.log(ml_all_methods);
          });


          vm.ml_methods = (true)
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
        }


        // Check if the method can be applied to the model
        function available_method(method) {
          if (method.disable) {
            console.log("method.disable");
            return false;
          }

          // Check constraints
          if (method.constraints) {
            // Output constraints
            if (method.constraints.variable) {
              if (!method.constraints.variable.real) {
                console.log("Check constraints");
                return false;
              }
            }

            if (method.constraints.covariables) {
              if (method.constraints.covariables.min_count) {
                console.log("method.constraints.covariables");
                return false;
              }

              if (method.constraints.covariables.max_count) {
                console.log("method.constraints.covariables.max_count");
                return false;
              }
            }

            // Grouping constraints
            if (method.constraints.grouping) {
              if (method.constraints.grouping.min_count) {
                console.log("method.constraints.grouping.min_count");
                return false;
              }

              if (method.constraints.grouping.max_count) {
                console.log("method.constraints.grouping.max_count");
                return false;
              }
            }
            if (!method.constraints.mixed) {
              console.log("grp_nb > 0");
              return false;
            }
          }

          return true;
        }





        // // function to be called when query and dataset are ready
        // function on_data_loaded() {
        //   vm.loaded = true;
        //   // vm.ml_methods = vm.mode.local.active
        //   vm.ml_methods = true
        //     ? ml_all_methods.filter(function(m) {
        //       return m.code.substr(0, 3) !== "WP_";
        //     })
        //     : ml_all_methods.filter(function(m) {
        //       return m.code.substr(0, 3) === "WP_";
        //     });
        //
        //   var variable_data = vm.dataset.data[vm.dataset.variable[0]]; // ???
        //
        //   vm.predicting_type = MLUtils.get_datatype(
        //     vm.dataset.variable[0],
        //     variable_data
        //   );
        //
        //   vm.ml_methods.forEach(function(method) {
        //     method.available = available_method(method);
        //     method.nyi = [
        //       "statisticsSummary",
        //       "svm",
        //       "randomforest",
        //       "gpr",
        //       "ffneuralnet"
        //     ].includes(method.code);
        //   });
        //
        //   // Open methods menu accordion
        //   vm.accordion = {
        //     statistics: true,
        //     features_extraction: true,
        //     predictive_model: true
        //   };
        // }
        //
        // on_data_loaded();
        //
        // vm.set_mode = function(mode) {
        //   var local = mode === "local";
        //   if (local === vm.mode.local.active) {
        //     return;
        //   }
        //
        //   vm.mode.local.active = local ? true : false;
        //   on_data_loaded();
        // };





        // this.breadcrumb = [];
        // this.$onChanges = () => {
        //   if (_.has(this.getFocusedVariable, 'code')){
        //     Variable
        //       .getBreadcrumb(this.getFocusedVariable.code)
        //       .then(breadcrumb => {
        //         breadcrumb.shift();//removes "root" node
        //         this.breadcrumb = breadcrumb;
        //       });
        //   }
        // }
      }
    ],
    templateUrl: 'scripts/app/models/variable_exploration/available_methods.html'
  });
