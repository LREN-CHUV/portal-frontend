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
    "$sce",
    function($compile, $http, $sce) {
      var linker = function($scope, element) {
        var data = $scope.data;
        var resultType = data.type;
        var mimeType = data && data.raw && data.raw.type;

        // Linear regression & ANOVA utility functions
        $scope.variable_title = function(variable_code) {
          // capitalize
          const code = variable_code
            .split(/[ _\-]/)
            .map(function(code_part) {
              return code_part.replace(/^[a-z]/, function(str) {
                return str.toUpperCase();
              });
            })
            .join(" ");

          return code.length > 50 ? code.split(":").join("<br>:") : code;
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
        switch (mimeType) {
          case "application/pfa+json":
          case "application/json":
            switch (resultType) {
              case "linearRegression":
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

              case "anova":
                templateUrl = "anova-results.html";
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

            var subData = data && data.raw.data;
            $scope.highchartdata = {
              data: subData.length > 2
                ? subData.map(formatFunc)
                : angular.isArray(subData)
                    ? formatFunc(subData[0])
                    : formatFunc(subData),
              isArray: subData.length > 2 ? true : false
            };
            break;

          case "image/svg+xml":
            templateUrl = "image-svg.html";
            $scope.svg = $sce.trustAsHtml(data.raw.data);
            break;

          case "application/vnd.plotly.v1+json":
            templateUrl = "plotly-results.html";
            $scope.chartData = data && data.raw.data;
            break;
          case "application/vnd.dataresource+json":
            templateUrl = "dataresource-results.html";
            const chartData = data && data.raw.data.resources
              ? data.raw.data.resources[0]
              : data.raw.data;
            $scope.chartData = chartData;
            break;

          case "application/vnd.visjs+javascript":
            templateUrl = "visjs-results.html";
            const visFunction =
              data &&
              data.raw &&
              data.raw.data &&
              data.raw.data.result &&
              data.raw.data.result.length &&
              data.raw.data.result.slice(1, -1);
            const js = `<script>var network; ${visFunction}</script>`;
            // // $scope.visData = () => eval(newFunction); // FIXME: evil hack
            $scope.visData = $sce.trustAsHtml(js);

            break;

          case "text/plain":
            templateUrl = "textplain-results.html";
            $scope.textData = data && data.raw && data.raw.data;

            break;

          case "text/html":
            templateUrl = "html-results.html";
            const html = data.raw.data.replace(
              "\u0026lt;!DOCTYPE html\u0026gt;",
              "<!DOCTYPE html>"
            );
            $scope.html = $sce.trustAsHtml(html);

            break;

          case "text/plain+error":
            templateUrl = "error.html";
            $scope.errorData = data && data.raw && data.raw.error;
            $scope.errorData = $scope.errorData
              ? $scope.errorData
              : data.raw && data.raw.data && data.raw.data.Error;

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
