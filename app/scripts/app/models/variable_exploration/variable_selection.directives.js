/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

"use strict";
angular
  .module("chuvApp.models")
  .directive("circlePacking", [
    function() {
      return {
        templateUrl: "scripts/app/models/variable_exploration/circle_packing.html",
        replace: true,
        link: function($scope, element) {
          $scope.search_history = [];
          $scope.search = {};

          var groups,
            disableLastWatch = function() {},
            group_dict,
            color = d3.scale
              .linear()
              .domain([-1, 5])
              .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
              .interpolate(d3.interpolateHcl),
            svg;

          function createCirclePackingDataStructure() {
            // all groups by code
            group_dict = {};

            function map_groups(group) {
              var description = group.label;
              if (group.description) description += "\n" + group.description;
              return (group_dict[group.code] = {
                label: group.label,
                code: group.code,
                is_group: true,
                original: group,
                description: description,
                children: group.groups.map(map_groups)
              });
            }

            // put groups in datastructure
            groups = map_groups($scope);

            // and then all the variables in all the right groups
            $scope.allVariables.forEach(function(variable) {
              var group = group_dict[variable.group.code],
                description = variable.label;
              if (variable.description)
                description += "\n" + variable.description;
              if (!group) return;
              group.children.push(
                (group_dict[variable.code] = {
                  code: variable.code,
                  label: variable.label,
                  is_group: false,
                  description: description,
                  original: variable,
                  children: []
                })
              );
            });
          }

          function applyNodeColors() {
            var circle = svg.selectAll("circle");
            circle.style("fill", color_for_node);
            Object.keys($scope.configuration).forEach(function(category) {
              circle.classed(category, function(node) {
                return (
                  node.code && $scope.variable_is_used_as(category, node.code)
                );
              });
            });
          }

          // clears the current circle packing and recreates it from crash.
          // quite compute intensive, do not overuse.
          // used when resizing
          // inspired from: bl.ocks.org/mbostock/7607535
          function updateCirclePacking() {
            element.find(".panel-body").empty();
            disableLastWatch();

            var margin = 20,
              diameter = element.width(),
              root = groups,
              pack = d3.layout
                .pack()
                .padding(2)
                // prevent sorting, otherwise packing will look way too regular.
                //.sort(null)
                // disabled: sort by descending value for better packing
                .sort(function comparator(a, b) {
                  return b.value - a.value;
                })
                .size([diameter - margin, diameter - margin])
                // circle weight is based on the length of text. It's not
                // strictly necessary but makes things nicer looking.
                .value(function(d) {
                  return 2 + d.label.length;
                });
            svg = d3
              .select(element.find(".panel-body")[0])
              .append("svg")
              .on("click", function() {
                zoom(root);
              })
              .attr("width", diameter)
              .attr("height", diameter)
              .append("g")
              .attr(
                "transform",
                "translate(" + diameter / 2 + "," + diameter / 2 + ")"
              );
            var focus = groups,
              nodes = pack.nodes(groups),
              view,
              circle = svg
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .filter(function(d) {
                  return !d.is_group || d.children;
                }) // Do not display enpty groups
                .attr("class", function(d) {
                  return d.parent
                    ? d.children ? "node" : "node node--leaf"
                    : "node node--root";
                })
                .style("fill", color_for_node)
                .on("click", function(d) {
                  if (focus !== d) {
                    zoom(d);
                  }
                  d3.event.stopPropagation();
                }),
              text = svg
                .selectAll("text")
                .data(nodes)
                .enter()
                .append("text")
                .filter(function(d) {
                  return !d.is_group || d.children;
                }) // Do not display enpty groups
                .attr("class", function(d) {
                  return d.children ? "circle-label group" : "circle-label";
                })
                .style("display", function(d) {
                  return d.parent === root ? "inline" : "none";
                })
                .text(function(d) {
                  if (!d.parent) return d.label;

                  // magic function to cut off text that's too long.
                  // I came up with this after a little trial and error
                  var max_length = 5 + d.r * 100 / d.parent.r;

                  if (d.label.length > max_length)
                    return d.label.substr(0, max_length - 3) + "...";
                  return d.label;
                }),
              node = svg.selectAll("circle,text");

            circle.append("title").text(function(d) {
              return d.description;
            });

            zoomTo([root.x, root.y, root.r * 2 + margin]);
            applyNodeColors();

            function zoom(d) {
              focus = d;

              var transition = d3
                .transition()
                .duration(750)
                .tween("zoom", function(d) {
                  return function(t) {
                    zoomTo(
                      d3.interpolateZoom(view, [
                        focus.x,
                        focus.y,
                        focus.r * 2 + margin
                      ])(t)
                    );
                  };
                });

              var condition = function(d) {
                return (
                  d && (d.parent === focus || (!d.children && d === focus))
                );
              };
              transition
                .selectAll("text")
                .filter(function(d) {
                  return this.style.display === "inline" || condition(d);
                })
                .style("fill-opacity", function(d) {
                  return condition(d) ? 1 : 0;
                })
                .each("start", function(d) {
                  if (condition(d)) this.style.display = "inline";
                })
                .each("end", function(d) {
                  if (!condition(d)) this.style.display = "none";
                });

              // this happens when a circle is clicked: bind the variable
              // and notify angular, since the event doesn't happen within angular.
              if ($scope.focused_variable !== d.original) {
                $scope.set_focused_variable(d !== groups && d.original);
                $scope.search.value = null;
                $scope.$apply();
              }
            }

            function zoomTo(v) {
              var k = diameter / v[2];
              view = v;
              node.attr("transform", function(d) {
                return (
                  "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                );
              });
              circle.attr("r", function(d) {
                return d.r * k;
              });
            }

            d3.select(self.frameElement).style("height", diameter + "px");

            disableLastWatch = $scope.$watch("focused_variable", function(
              variable
            ) {
              if (variable && variable.code && group_dict[variable.code])
                zoom(group_dict[variable.code]);
            });
          }

          function color_for_node(node) {
            var category = _.find(Object.keys($scope.configuration), function(
              category
            ) {
              return (
                node.code && $scope.variable_is_used_as(category, node.code)
              );
            });
            if (category) {
              return null;
            }
            return node.children ? color(node.depth) : null;
          }

          $scope.$on("configurationChanged", applyNodeColors);

          // update circle packing whenever groups change
          // (won't happen often)
          $scope.$watch("groups", function(groups) {
            if (groups != null) {
              createCirclePackingDataStructure();
              updateCirclePacking();
            }
          });

          //redraw the whole stuff when resizing.
          //every circle changes size and position, so I might as well...
          var prev_dimension = element.width();
          function resize_handler() {
            if ($scope.groups != null && element.width !== prev_dimension) {
              prev_dimension = element.width();
              updateCirclePacking();
              $scope.$apply();
            }
          }
          angular.element(window).bind("resize", resize_handler);
          $scope.$on("$destroy", function() {
            angular.element(window).unbind("resize", resize_handler);
          });

          $scope.$watch("search.value", function(variable) {
            if (variable && variable.code && group_dict[variable.code]) {
              $scope.set_focused_variable(variable);

              if ($scope.search_history.indexOf(variable) < 0) {
                $scope.search_history.unshift(variable);
                if ($scope.search_history.length > 5) {
                  $scope.search_history.pop();
                }
              }
            }
          });
        }
      };
    }
  ])
  .directive("variableStatistics", [
    "$timeout",
    "$filter",
    "Variable",
    "$stateParams",
    function($timeout, $filter, Variable, $stateParams) {
      return {
        templateUrl: "scripts/app/models/variable_exploration/variable_statistics.html",
        link: function($scope, element) {
          // so that two simultaneous requests don't clash.
          var request_id = 0;

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

          $scope.$watch("focused_variable", function(focused_variable) {
            if (!focused_variable || !focused_variable.code) return;

            $scope.focused_variable_loaded = false;
            $scope.has_error = false;

            request_id++;
            var current_request_id = request_id;

            $scope.variable_description = focused_variable.description;

            Variable.get_histo(focused_variable.code).then(
              function(response) {
                if (current_request_id != request_id) return;
                $scope.focused_variable_loaded = true;

                $scope.stats = response.data.data;

                if (!angular.isArray($scope.stats)) {
                  $scope.stats = [$scope.stats];
                }

                // $scope.measurement_count = ($scope.stats.length && $scope.stats[0].count) || "??";
              },
              function() {
                if (current_request_id != request_id) return;
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
  ])
  .directive("variableDescription", [
    function() {
      return {
        scope: {
          text: "="
        },
        template: "<p ng-repeat='paragraph in real_text'>{{paragraph}} <a ng-if='is_shortened && $index==real_text.length-1' ng-click='show_full()'>More</a></p>",
        controller: [
          "$scope",
          function($scope) {
            $scope.$watch("text", function(val) {
              if (!angular.isString(val)) {
                $scope.real_text = "";
                return;
              }

              if (val.length < 600) {
                $scope.real_text = val;
                $scope.is_shortened = false;
              } else {
                $scope.real_text = val.substr(0, 400) + "...";
                $scope.is_shortened = true;
              }
              $scope.real_text = $scope.real_text.split("\n");
            });

            $scope.show_full = function() {
              $scope.real_text = $scope.text.split("\n");
              $scope.is_shortened = false;
            };
          }
        ]
      };
    }
  ])
  .directive("variableConfiguration", function() {
    return {
      templateUrl: "scripts/app/models/variable_exploration/variable_configuration.html",
      scope: {
        setFocusedVariable: "=",
        setVariableSelectedAs: "=",
        getFocusedVariable: "=",
        configuration: "="
      },
      controller: [
        "$scope",
        "$location",
        "$timeout",
        function($scope, $location, $timeout) {
          $scope.do_configure = false;

          // configure panel starts hidden, and then reveals itself if needed.
          $timeout(function() {
            $scope.do_configure = !!$location.search().configure;
          });

          $scope.set_configure = function() {
            $scope.do_configure = true;
          };

          $scope.has_configuration = function() {
            return _.any(Object.keys($scope.configuration), function(sub_arr) {
              return Object.keys($scope.configuration[sub_arr]).length;
            });
          };

          $scope.get_button_label = function(type) {
            var focusedVariable = $scope.getFocusedVariable(),
              is_group = focusedVariable && !!focusedVariable.groups,
              is_used_as =
                focusedVariable &&
                focusedVariable.code in $scope.configuration[type];

            return (
              [["Use", "Remove"], ["Add all", "Remove all"]][+is_group][
                +is_used_as
              ] +
              " as " +
              type
            );
          };
        }
      ]
    };
  });
