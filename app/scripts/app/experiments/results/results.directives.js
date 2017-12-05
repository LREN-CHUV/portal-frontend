angular
  .module("chuvApp.experiments")
  /**
 *
 * TODO In the future separate method-result from validation-result:
 * TODO For a given method we might want to display a specific view followed by the generic validation infos...
 *
 * In function of type of method get the right result template...
 */
  .directive("methodResult", [
    "$compile",
    "$http",
    function($compile, $http) {
      // TODO package all the templates at once...
      var getTemplate = function(type) {
        var templateUrl = "default-results.html";
        switch (type) {
          case "linearRegression":
            templateUrl = "linear-regression-results.html";
            break;
          case "anova":
            templateUrl = "anova-results.html";
            break;
          case "binary_classification":
            templateUrl = "binary-classification-results.html";
            break;
          case "classification":
            templateUrl = "default-classification-results.html";
            break;
          case "regression":
            templateUrl = "default-regression-results.html";
            break;
          case "histograms":
            templateUrl = "highchart-results.html";
            break;
        }

        return $http.get("scripts/app/experiments/results/" + templateUrl);
      };

      var linker = function($scope, element) {

        // FIXME: type !== "unknown"
        var name = $scope.data.type !== "unknown" ? $scope.data.type : $scope.data.name.toLowerCase()

        // TODO package all the templates at once...
        getTemplate(name).then(function(response) {
          element.html(response.data).show();
          $compile(element.contents())($scope);
        });

        // Histogram utility function
        $scope.init_hc_config = function(statistic) {
          if (statistic.hc_config) return;

          statistic.hc_config = {
            options: {
              chart: statistic.chart
            },
            xAxis: statistic.xAxis,
            yAxis: statistic.yAxis,
            series: statistic.series,
            title: statistic.title
          };
        };

        // Linear regression & ANOVA utility functions...
        // TODO Put somewhere
        $scope.variable_title = function(variable_code) {
          // capitalize
          return variable_code
            .split(/[ _\-]/)
            .map(function(code_part) {
              return code_part.replace(/^[a-z]/, function(str) {
                return str.toUpperCase();
              });
            })
            .join(" ");
        };

        $scope.pvalue_quality = function(pvalue) {
          pvalue = Math.abs(pvalue);
          if (pvalue <= 0.001) return "(★★★)";
          if (pvalue <= 0.01) return "(★★)";
          if (pvalue <= 0.1) return "(★)";
          return "";
        };
      };

      return {
        restrict: "E",
        link: linker,
        scope: {
          data: "="
        }
      };
    }
  ]);
