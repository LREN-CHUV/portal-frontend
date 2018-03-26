"use strict";

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
      var linker = function($scope, element) {
        var data = $scope.data;
        var algorithm = data && data.algorithm;
        var type = data && data.type;

        // Linear regression & ANOVA utility functions
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
          if (pvalue <= 0.001) {
            return "(★★★)";
          }
          if (pvalue <= 0.01) {
            return "(★★)";
          }
          if (pvalue <= 0.1) {
            return "(★)";
          }
          return "";
        };

        var templateUrl = "default-results.html";
        switch (type) {
          case "regression":
            templateUrl = "default-regression-results.html";
            break;
          case "application/pfa+json":
            switch (algorithm) {
              case "java-rapidminer-knn":
                templateUrl = "default-classification-results.html";
                break;

              case "python-anova":
                templateUrl = "anova-results.html";
                break;
            }
            break;

          case "application/json":
            switch (algorithm) {
              case "python-linear-regression":
                templateUrl = "linear-regression-results.html";
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
            }
            break;

          case "application/vnd.highcharts+json":
          case "application/highcharts+json":
            templateUrl = "highchart-results.html";
            var formatFunc = function(stat) {
              return {
                options: {
                  chart: stat.chart
                },
                chart: stat.chart,
                xAxis: stat.xAxis,
                yAxis: stat.yAxis,
                series: stat.series,
                title: {
                  text: stat.title &&
                    stat.title.text &&
                    stat.title.text
                      .split(" ")
                      .slice(0, 5)
                      .join(" ")
                      .slice(0, -1) + "..."
                },
                label: stat.label
              };
            };

            var subData = data && data.data;
            $scope.highchartdata = {
              data: subData.length > 2
                ? subData.map(formatFunc)
                : angular.isArray(subData)
                    ? formatFunc(subData[0])
                    : formatFunc(subData),
              isArray: subData.length > 2 ? true : false
            };
            break;

          case "text/plain+error":
            templateUrl = "error.html";
            break;
        }

        $http
          .get("scripts/app/experiments/results/" + templateUrl)
          .then(function(response) {
            element.html(response.data).show();
            $compile(element.contents())($scope);
          });
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
