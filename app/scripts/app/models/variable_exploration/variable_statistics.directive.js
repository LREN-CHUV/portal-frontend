/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

"use strict";
angular.module("chuvApp.models").directive("variableStatistics", [
  "$timeout",
  "$filter",
  "Variable",
  // "$stateParams",
  function($timeout, $filter, Variable /*, $stateParams*/) {
    // TODO: var isn't used, commented to jshint warning detection
    return {
      templateUrl: "scripts/app/models/variable_exploration/variable_statistics.html",
      link: function($scope /*, element*/) {
        // TODO: var isn't used, commented to jshint warning detection
        // so that two simultaneous requests don't clash.
        var request_id = 0;

        $scope.init_hc_config = function(statistic) {
          if (statistic.hc_config) {
            return;
          }
          var title = { text: statistic.label };

          statistic.hc_config = {
            chart: statistic.chart,
            xAxis: statistic.xAxis,
            yAxis: statistic.yAxis,
            series: statistic.series,
            title: title //statistic.title
          };
          console.log("statistic : ", statistic);
        };

        $scope.$watch("focused_variable", function(focused_variable) {
          if (!focused_variable || focused_variable.is_group) {
            var node;

            if (focused_variable && focused_variable.code) {
              var ii;
              var stack = $scope.populatedGroups.children.slice(0);
              while (stack.length > 0) {
                node = stack.pop();
                if (node.code == focused_variable.code) {
                  // Found it!
                  break;
                } else if (node.children && node.children.length) {
                  for (ii = 0; ii < node.children.length; ii += 1) {
                    stack.push(node.children[ii]);
                  }
                }
              }
            } else {
              node = $scope.populatedGroups;
            }

            var count = 0;
            var recNodeCalc = function(node) {
              if (!node || !node.children) return;
              node.children.map(function(c) {
                count = c.is_group ? count : count + 1;
                recNodeCalc(c);
              });
            };
            recNodeCalc(node);

            $scope.groupStats = { count };
            $scope.focused_variable_loaded = true;

            return;
          }

          $scope.focused_variable_loaded = false;
          $scope.has_error = false;

          request_id++;
          var current_request_id = request_id;

          $scope.variable_description = focused_variable.description;

          Variable.get_histo(
            focused_variable.code,
            $scope.selectedDatasets.map(d => ({ code: d }))
          ).then(
            function(response) {
              if (current_request_id != request_id) {
                return;
              }
              $scope.focused_variable_loaded = true;

              $scope.stats = response.data && response.data.data;
              console.log("$scope.stats : ", $scope.stats);

              if (!angular.isArray($scope.stats)) {
                $scope.stats = [$scope.stats];
              }
            },
            function() {
              if (current_request_id != request_id) {
                return;
              }
              $scope.has_error = true;
              $scope.focused_variable_loaded = true;
            }
          );
        });

        // this is to overcome a ng-highcharts sizing bug.
        $scope.show_stats_after_timeout = function(statistics) {
          $scope.stats.forEach(function(stat) {
            stat.active = false;
          });

          statistics.active = true;
          $scope.show = false;
          $timeout(function() {
            $scope.show = true;
          }, 0);
        };
      }
    };
  }
]);
