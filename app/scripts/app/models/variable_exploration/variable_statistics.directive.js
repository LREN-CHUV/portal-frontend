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

          statistic.hc_config = {
            chart: statistic.chart,
            xAxis: statistic.xAxis,
            yAxis: statistic.yAxis,
            series: statistic.series,
            title: statistic.title
          };
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
                if (c.is_group) { ++count; }
                recNodeCalc(c);
              });
            };
            recNodeCalc(node);

            $scope.groupStats = { count };
            $scope.focused_variable_loaded = true;

            return;
          }

          getVariableHistogram( focused_variable, $scope.selectedDatasets, $scope.current_request_id );
        });

        $scope.$on("event:selectedDatasetIsChanged", function(event, data) {
          getVariableHistogram( $scope.focused_variable, data, $scope.current_request_id, true );
        });

        function getVariableHistogram( focused_variable, selected_dataset, current_request_id, changeDataset ){
          $scope.focused_variable_loaded = false;
          $scope.has_error = false;

          request_id++;
          $scope.current_request_id = request_id;

          $scope.variable_description = (changeDataset) ?
            $scope.focused_variable.description : focused_variable.description;

          Variable.get_histo(
            focused_variable.code,
            selected_dataset.map(d => ({ code: d }))
          ).then(
            function(response) {
              if ($scope.current_request_id != request_id) {
                return;
              }
              $scope.focused_variable_loaded = true;

              $scope.stats = response.data && response.data.data;

              if (!angular.isArray($scope.stats)) {
                $scope.stats = [$scope.stats];
              }
            },
            function() {
              if ($scope.current_request_id != request_id) {
                return;
              }
              $scope.has_error = true;
              $scope.focused_variable_loaded = true;
            }
          );
        }

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
