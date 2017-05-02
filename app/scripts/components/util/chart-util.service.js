/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

angular.module("chuvApp.util").factory("ChartUtil", [
  "$filter",
  "notifications",
  function($filter, notifications) {
    var number = $filter("number");

    var colorCategories = d3.scale.category10();

    function getColorScale(array, colorIndex) {
      var hue = colorIndex * 70 % 360,
        max = _.max(array),
        min = _.min(array),
        target_max = 0.75,
        target_min = 0.25;

      return _.map(array, function(val) {
        return d3
          .hsl(
            hue,
            0.7,
            (val - min) / (max - min) * (target_max - target_min) + target_min
          )
          .toString();
      });
    }

    // map array to number array
    function aToI(arr) {
      return arr.map(function(x) {
        return +x;
      });
    }

    function orderBy(sortAxis, data) {
      var sortedData = _.chain(data.concat([sortAxis]))
        .unzip()
        .sortBy(data.length)
        .unzip()
        .value();
      return [sortedData, sortedData.pop()];
    }

    function groupBy(groupAxis, data) {
      if (!groupAxis) return data;

      var sortedData = orderBy(groupAxis, data),
        dataIdx,
        arrayIdx,
        result = new Array(data.length),
        sortedXAxis = sortedData[1];
      sortedData = sortedData[0];

      for (dataIdx = 0; dataIdx < sortedData.length; dataIdx++) {
        result[dataIdx] = result[dataIdx] || new Array(groupAxis.length);
        for (arrayIdx = 0; arrayIdx < groupAxis.length; arrayIdx++) {
          result[dataIdx][arrayIdx] = [
            sortedXAxis[arrayIdx],
            sortedData[dataIdx][arrayIdx]
          ];
        }
      }
      return result;
    }

    function isNumberArray(data) {
      return !_.any(data, isNaN);
    }

    /**
     * Creates a HC boxplot config. Note that X and Y are invertes
     */
    function buildBoxPlot(config, dataset) {
      var result = [], categories = [];
      if (
        config.xAxisVariable &&
        ChartUtil.canUseAsYAxis(
          config.xAxisVariable,
          "boxplot",
          dataset.data[config.xAxisVariable]
        )
      ) {
        var groupingAxis;

        if (!config.yAxisVariables.length) {
          groupingAxis = new Array(
            dataset.data[dataset.variable[0]].length
          ).fill("All");
        } else {
          groupingAxis = _.chain(config.yAxisVariables)
            .map(function(axisCode) {
              return dataset.data[axisCode];
            })
            .unzip()
            .map(function(vals) {
              return vals.join(", ");
            })
            .value();
        }

        var data = _.chain([groupingAxis, dataset.data[config.xAxisVariable]])
          .unzip()
          .groupBy(0)
          .mapObject(_.partial(_.map, _, 1))
          .pairs()
          .value(),
          array_data,
          idx;

        for (idx = 0; idx < data.length; idx++) {
          array_data = _.sortBy(data[idx][1]);

          result.push([
            array_data[Math.floor(array_data.length / 10.0)], // 1st decile
            array_data[Math.floor(array_data.length / 4.0)], // Q1
            array_data[Math.floor(array_data.length / 2.0)], // Q2
            array_data[Math.floor(array_data.length * 3.0 / 4.0)], // Q3
            array_data[Math.floor(array_data.length * 9.0 / 10.0)] // 9th decile
          ]);
        }

        categories = _.map(data, 0);
      }

      return {
        options: {
          chart: {
            type: "boxplot"
          }
        },
        title: config.title || {
          text: null,
          enabled: false
        },
        xAxis: {
          categories: categories,
          title: null
        },
        yAxis: {
          title: null
        },
        size: {
          height: config.height,
          width: config.width
        },
        series: [
          {
            name: config.xAxisVariable,
            data: result,
            index: 1,
            id: 1
          }
        ]
      };
    }

    // okay so these are globals and it's really bad, but I have a scope/cache issue with the formatter for HC
    // so check that before you remove those.
    var dm_mins = [], dm_maxes = [];
    function buildDesignMatrix(config, dataset) {
      config.hasXAxis = true;

      // all variables
      var headers = dataset.variable
        .concat(dataset.grouping)
        .concat(dataset.header),
        variables = _.filter(headers, function(header) {
          return (
            config.yAxisVariables.indexOf(header) >= 0 &&
            !_.any(dataset.data[header], function(datapoint) {
              return isNaN(+datapoint);
            })
          );
        }),
        xAxisVariableIdx,
        variableIdxs = {},
        // all the data, with numbers represented as string that are mapped to actual numbers
        raw_data = headers.map(function(name, index) {
          if (name === config.xAxisVariable) xAxisVariableIdx = index;
          variableIdxs[name] = index;
          return isNumberArray(dataset.data[name])
            ? aToI(dataset.data[name])
            : dataset.data[name];
        }),
        // whether the x axis is string-indexed or number-indexed
        xSortingByNumber =
          angular.isNumber(xAxisVariableIdx) &&
          isNumberArray(raw_data[xAxisVariableIdx]),
        // the actual data for HC
        sorted_data = xSortingByNumber
          ? orderBy(raw_data[xAxisVariableIdx], raw_data)[0]
          : raw_data;

      dm_mins.length = 0;
      dm_maxes.length = 0;

      return {
        options: {
          chart: {
            type: "heatmap",
            zoomType: "y"
          },
          colorAxis: {
            minColor: "#FFFFFF",
            maxColor: "#000000"
          },
          tooltip: {
            formatter: function() {
              return number(
                this.point.value *
                  (dm_maxes[this.point.x] - dm_mins[this.point.x]) +
                  dm_mins[this.point.x]
              );
            }
          }
        },
        title: angular.isDefined(config.title)
          ? config.title
          : { text: "Design matrix" },
        xAxis: {
          categories: variables,
          title: null
        },
        yAxis: {
          title: null,
          labels: { enabled: false }
        },
        size: {
          height: config.height,
          width: config.width
        },
        series: [
          {
            name: null,
            borderWidth: 0,
            index: 1,
            data: (function() {
              // create a list of [coord X, coord Y, val]
              // this is the dataset expected by highcharts
              var result = [], min, max, idx1, idx2, data;

              for (idx1 = 0; idx1 < variables.length; idx1++) {
                data = sorted_data[variableIdxs[variables[idx1]]];
                max = _.max(data);
                min = _.min(data);
                for (idx2 = 0; idx2 < data.length; idx2++) {
                  result.push([
                    idx1,
                    idx2,
                    (data[idx2] - min) / (max - min),
                    min,
                    max
                  ]);
                }
                dm_mins.push(min);
                dm_maxes.push(max);
              }

              return result;
            })()
          }
        ]
      };
    }

    function buildRegularChart(type) {
      return function(config, dataset) {
        config.hasXAxis = true;

        // all variables
        var headers = dataset.variable
          .concat(dataset.grouping)
          .concat(dataset.header),
          // if sorting, then the index (within headers) of the sorting variable
          xAxisVariableIdx,
          variableIdxs = {},
          // all the data, with numbers represented as string that are mapped to actual numbers
          raw_data = headers.map(function(name, index) {
            if (name === config.xAxisVariable) xAxisVariableIdx = index;
            variableIdxs[name] = index;
            return isNumberArray(dataset.data[name])
              ? aToI(dataset.data[name])
              : dataset.data[name];
          }),
          // whether the x axis is string-indexed or number-indexed
          xSortingByString =
            angular.isNumber(xAxisVariableIdx) &&
            !isNumberArray(raw_data[xAxisVariableIdx]),
          // the actual data for HC
          data = angular.isNumber(xAxisVariableIdx)
            ? groupBy(raw_data[xAxisVariableIdx], raw_data)
            : raw_data,
          // the categories for HC (if applicable)
          categories = xSortingByString
            ? _.uniq(raw_data[xAxisVariableIdx])
            : undefined;

        // if line or bar, do average when sorting
        if (
          angular.isNumber(xAxisVariableIdx) &&
          (type === "line" || type === "column")
        ) {
          data = data.map(function(array) {
            var result = _.chain(array)
              .groupBy(0)
              .mapObject(function average(arr) {
                return (
                  _.reduce(
                    arr,
                    function(memo, num) {
                      return memo + num[1];
                    },
                    0
                  ) / (arr.length === 0 ? 1 : arr.length)
                );
              })
              .pairs();

            if (!xSortingByString) {
              result = result
                .map(function(point) {
                  return [+point[0], point[1]];
                })
                .sortBy(0);
            }

            return result.value();
          });
        }

        if (xSortingByString) {
          data.forEach(function(array) {
            array.forEach(function(point) {
              point[0] = categories.indexOf(point[0]);
            });
          });
        }

        // make coloring
        if (type === "scatter" && config.coloringVariable) {
          var coloring_data = data[variableIdxs[config.coloringVariable]];
          if (config.xAxisVariable) {
            coloring_data = _.map(coloring_data, 1);
          }
          if (!isNumberArray(coloring_data)) {
            var string_to_number = {}, idx = 0;
            coloring_data = coloring_data.map(function(str_pt) {
              if (!string_to_number.hasOwnProperty(str_pt)) {
                string_to_number[str_pt] = idx++;
              }
              return string_to_number[str_pt];
            });
          }

          config.yAxisVariables.forEach(function(code, index) {
            data[variableIdxs[code]] = _.zip(
              data[variableIdxs[code]],
              getColorScale(coloring_data, index)
            ).map(function(point, idx) {
              return {
                x: config.xAxisVariable ? point[0][0] : idx,
                y: config.xAxisVariable ? point[0][1] : point[0],
                marker: {
                  fillColor: point[1]
                }
              };
            });
          });
        }

        return {
          xAxis: {
            code: config.xAxisVariable,
            title: { text: config.xAxisVariable },
            categories: categories
          },
          yAxis: {
            title: null
            //labels: {enabled: false}
          },
          title: {
            text: null
          },
          size: {
            height: config.height,
            width: config.width
          },
          options: {
            chart: {
              type: type
            },
            legend: {
              enabled: config.showLegend !== false
            }
          },
          series: config.yAxisVariables.map(function(code, index) {
            return {
              name: code,
              data: data[variableIdxs[code]],
              index: index,
              id: index,
              legendIndex: index
            };
          })
        };
      };
    }

    var ChartUtil = function ChartUtil(config, dataset, notify) {
      if (!dataset) {
        return null;
      }

      // *** Remove null values ***
      var nullIndices = new Array();
      _.each(dataset.data, function(varData) {
        for (var i = 0; i < varData.length; i++) {
          if (varData[i] == "null") {
            nullIndices.push(i);
          }
        }
      });
      nullIndices = _.uniq(nullIndices);
      for (var varCode in dataset.data) {
        if (dataset.data.hasOwnProperty(varCode)) {
          for (var i = 0; i < nullIndices.length; i++) {
            delete dataset.data[varCode][nullIndices[i]];
          }
          dataset.data[varCode] = _.compact(dataset.data[varCode]);
        }
      }
      var nbDiscardedRows = nullIndices.length;
      if (notify && nbDiscardedRows > 0) {
        notifications.warning(nbDiscardedRows + " rows have been discarded");
      }
      // **************************

      if (!angular.isArray(config.yAxisVariables)) {
        config.yAxisVariables = _.clone(dataset.header);
      }

      return ({
        designmatrix: buildDesignMatrix,
        boxplot: buildBoxPlot,
        scatter: buildRegularChart("scatter"),
        column: buildRegularChart("column"),
        line: buildRegularChart("line")
      }[config.type] || angular.identity)(config, dataset);
    };

    // axis configuration information

    var axisUsability = {}, invertedAxisPlots = ["designmatrix", "boxplot"];

    ChartUtil.canUseAsXAxis = function(axeCode, chartType, dataArray) {
      return ({
        boxplot: function() {
          return _.uniq(dataArray).length <= 8;
        },
        line: function() {
          return _.uniq(dataArray).length >= 8;
        },
        designmatrix: function() {
          return ChartUtil.canUseAsYAxis(axeCode, chartType, dataArray);
        }
      }[chartType] ||
        function() {
          return true;
        })();
    };

    ChartUtil.canUseAsYAxis = function(axeCode, chartType, dataArray) {
      if (!axisUsability.hasOwnProperty(axeCode)) {
        axisUsability[axeCode] = !_.any(dataArray, function(datapoint) {
          return !isFinite(datapoint);
        });
      }
      return axisUsability[axeCode];
    };

    ChartUtil.isXAxisMain = function(chartType) {
      return invertedAxisPlots.indexOf(chartType) < 0;
    };

    return ChartUtil;
  }
]);
