"use strict";
angular.module("chuvApp.models").component("varcounter", {
  bindings: {
    getFocusedVariable: "<"
  },
  controller: [
    "Variable",
    function(Variable) {
      const getVarCount = focusedVariable => {
        if (_.has(focusedVariable, "code")) {
          Variable.getSubCategoryVariableCounter(
            focusedVariable.code
          ).then(subCategoryVariableCounter => {
            this.showChart = subCategoryVariableCounter.length > 0;
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

      this.showChart = false;

      getVarCount(this.getFocusedVariable);

      this.$onChanges = () => {
        getVarCount(this.getFocusedVariable);
      };
    }
  ],
  templateUrl: "scripts/app/models/variable_exploration/varcounter.html"
});
