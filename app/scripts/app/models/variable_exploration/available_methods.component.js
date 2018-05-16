"use strict";
angular.module("chuvApp.models").component("availableMethods", {
  bindings: {
    getFocusedVariable: "<"
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

      vm.ml_methods = [];

      // save config as local
      Config.then(function(config) {
        vm.config = config;
      });

      // Get the ml methods
      MLUtils.list_ml_methods().then(function(data) {
        vm.ml_methods = data
          .filter(
            f => ( vm.config.mode === "federation" ? true : f.environment !== "Exareme")
          )
          .filter(
            f => f.code !== "histograms" && f.code !== "statisticsSummary"
          );
      });

      vm.$onChanges = (data) => {
        vm.ml_methods.forEach(function(method) {
          method.available = available_method(method);
          method.experimental = method.maturity === "experimental";
          method.nyi = method.maturity === "coming_soon";
        });
      };

      // Check if the method is not disabled
      function available_method(method) {
        return (method.disable) ? false : true;
      }
    }
  ],
  templateUrl: "scripts/app/models/variable_exploration/available_methods.html"
});
