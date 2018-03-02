"use strict";
angular.module("chuvApp.models").component("varcounter", {
  bindings: {
    getFocusedVariable: "<"
  },
  controller: [
    "Variable",
    function(Variable) {
      const getVarChount = focusedVariable => {
        if (_.has(focusedVariable, "code")) {
          Variable.getSubCategoryVariableCounter(
            focusedVariable.code
          ).then(subCategoryVariableCounter => {
            var highchartData = {
              chart: {
                type: "column"
              },
              title: {
                text: "Variables contained in subgroups"
              },
              legend: {
                enabled: false
              },
              tooltip: {
                enabled: false
              },
              xAxis: {
                categories: subCategoryVariableCounter.map(group => group.code)
              },
              series: [
                {
                  data: subCategoryVariableCounter.map(group => group.counter)
                }
              ]
            };
            this.subCategoryVariableCounter = highchartData;
          });
        }
      };

      getVarChount(this.getFocusedVariable);

      this.$onChanges = () => {
        getVarChount(this.getFocusedVariable);
      };
    }
  ],
  templateUrl: "scripts/app/models/variable_exploration/varcounter.html"
});
