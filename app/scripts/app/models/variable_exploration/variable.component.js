"use strict";
angular.module("chuvApp.models").component("variable", {
  bindings: {
    code: "<"
  },
  controller: [
    "Variable",
    function(Variable) {
      const getVariableName = code => {
        if (typeof code !== "undefined") {
          Variable.getVariableData(code).then(variableData => {
            this.label = variableData.data.label;
          });
        }
      };
      getVariableName(this.code);

      this.$onChanges = () => {
        getVariableName(this.code);
      };
    }
  ],
  templateUrl: "scripts/app/models/variable_exploration/variable.html"
});
