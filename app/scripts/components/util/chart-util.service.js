/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

angular.module('chuvApp.util')
  .factory('ChartUtil', ['$filter', function ($filter) {

    var number = $filter("number");

    // map array to number array
    function aToI(arr) {
      return arr.map(function (x) { return +x;});
    }

    function orderBy(sortAxis, data) {
      var sortedData = _.chain(data.concat([sortAxis]))
        .unzip()
        .sortBy(data.length)
        .unzip()
        .value();
      return [sortedData, sortedData.pop()]
    }

    function groupBy(groupAxis, data) {
      if (!groupAxis)
        return data;

      var sortedData = orderBy(groupAxis, data),
        dataIdx,
        arrayIdx,
        result = new Array(data.length),
        sortedXAxis = sortedData[1];
      sortedData = sortedData[0];

      for (dataIdx = 0; dataIdx < sortedData.length; dataIdx++) {
        result[dataIdx] = result[dataIdx] || new Array(groupAxis.length);
        for (arrayIdx = 0; arrayIdx < groupAxis.length; arrayIdx++) {
          result[dataIdx][arrayIdx] = [sortedXAxis[arrayIdx], sortedData[dataIdx][arrayIdx]];
        }
      }
      return result;
    }

    function isNumberArray(data) {
      return !_.any(data, isNaN)
    }

    function  buildBoxPlot (config, dataset) {
      config.hasXAxis = false;

      var data, result = [], idx1, idx2;

      for (idx1 = 0; idx1 < config.yAxisVariables.length; idx1++) {
        data = _.sortBy(dataset.data[config.yAxisVariables[idx1]]);

        result.push([
          data[Math.floor(data.length / 10.0)], // 1st decile
          data[Math.floor(data.length / 4.0)], // Q1
          data[Math.floor(data.length / 2.0)], // Q2
          data[Math.floor(data.length * 3.0 / 4.0)], // Q3
          data[Math.floor(data.length * 9.0 / 10.0)] // 9th decile
        ])
      }

      return {
        options: {
          "chart": {
            "type":"boxplot"
          },
          legend: {
            enabled: false
          },
        },
        title:  angular.isDefined(config.title) ? config.title : {
          text: "Box Plot"
        },
        xAxis: {
          categories: dataset.header,
          title: null
        },
        yAxis: {
          title: null
        },
        size: {
          height: config.height,
          width: config.width
        },
        series: [{
          name: "",
          data: result,
          index: 1,
          id: 1
        }]
      };
    }


    function buildDesignMatrix (config, dataset) {
      config.hasXAxis = true;

      // all variables
      var headers = dataset.variable.concat(dataset.grouping).concat(dataset.header),

        variables = _.filter(
          headers,
          function (header) {
            return config.yAxisVariables.indexOf(header) >= 0;
          }
        ),
        mins = [],
        maxes = [],
        xAxisVariableIdx,
        variableIdxs = {},

        // all the data, with numbers represented as string that are mapped to actual numbers
          raw_data = headers.map(function (name, index) {
            if (name === config.xAxisVariable)
              xAxisVariableIdx = index;
            variableIdxs[name] = index;
          return isNumberArray(dataset.data[name]) ? aToI(dataset.data[name]) : dataset.data[name];
        }),

        // whether the x axis is string-indexed or number-indexed
          xSortingByNumber = angular.isNumber(xAxisVariableIdx) && isNumberArray(raw_data[xAxisVariableIdx]),

        // the actual data for HC
          sorted_data = xSortingByNumber ? orderBy(raw_data[xAxisVariableIdx], raw_data)[0] : raw_data;

      return {
        options: {
          "chart": {
            "type":"heatmap",
            "zoomType":"y"
          },
          colorAxis: {
            minColor: '#FFFFFF',
            maxColor: '#000000'
          },
          tooltip: {
            formatter: function () {
              return number(this.point.value * (maxes[this.point.x] - mins[this.point.x]) + mins[this.point.x]);
            }
          },
        },
        title: angular.isDefined(config.title) ? config.title : {text: "Design matrix"},
        xAxis: {
          categories: variables,
          title: null
        },
        yAxis: {
          title: null,
          labels: {enabled: false}
        },
        size: {
          height: config.height,
          width: config.width
        },
        series: [{
          name: null,
          borderWidth: 0,
          index: 1,
          data: function() {

            // create a list of [coord X, coord Y, val]
            // this is the dataset expected by highcharts
            var result = [],
              min, max, idx1, idx2, data;

            for (idx1 = 0; idx1 < variables.length; idx1++) {
              data = sorted_data[variableIdxs[variables[idx1]]];
              max = _.max(data);
              min = _.min(data);
              for (idx2 = 0; idx2 < data.length; idx2++) {
                result.push([idx1, idx2, (data[idx2] - min) / (max - min), min, max]);
              }
              mins.push(min);
              maxes.push(max);
            }

            return result;
          }()
        }]
      };
    }

    function buildRegularChart (type) {

      return function (config, dataset) {
        config.hasXAxis = true;

        // all variables
        var headers = dataset.variable.concat(dataset.grouping).concat(dataset.header),

        // if sorting, then the index (within headers) of the sorting variable
          xAxisVariableIdx,
          variableIdxs = {},

        // all the data, with numbers represented as string that are mapped to actual numbers
          raw_data = headers.map(function (name, index) {
            if (name === config.xAxisVariable)
              xAxisVariableIdx = index;
            variableIdxs[name] = index;
            return isNumberArray(dataset.data[name]) ? aToI(dataset.data[name]) : dataset.data[name];
          }),

        // whether the x axis is string-indexed or number-indexed
          xSortingByString = angular.isNumber(xAxisVariableIdx) && !isNumberArray(raw_data[xAxisVariableIdx]),

        // the actual data for HC
          data = angular.isNumber(xAxisVariableIdx) ? groupBy(raw_data[xAxisVariableIdx], raw_data) : raw_data,

        // the categories for HC (if applicable)
          categories = xSortingByString ? _.uniq(raw_data[xAxisVariableIdx]) : undefined;

        // if line or bar, do average when sorting
        if (angular.isNumber(xAxisVariableIdx) && (type === 'line' || type === 'column')) {
          data = data.map(function (array) {
            var result = _.chain(array)
              .groupBy(0)
              .mapObject(function average (arr) {
                return _.reduce(arr, function(memo, num) {
                    return memo + num[1];
                  }, 0) / (arr.length === 0 ? 1 : arr.length);
              })
              .pairs();

            if (!xSortingByString) {
              result = result.map(function (point) {
                return [+point[0], point[1]];
              });
            }

            return result.value()
          });
        }

        if (xSortingByString) {
          data.forEach(function (array) {
            array.forEach(function (point) {
              point[0] = categories.indexOf(point[0]);
            });
          })
        }

        if (config.colorByVariable) {
          // make coloring
        }

        return {
          xAxis: {
            code: config.xAxisVariable,
            title: { text: config.xAxisVariable},
            categories: categories
          },
          yAxis: {
            title: null,
            labels: {enabled: false}
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
            }
          },
          series: config.yAxisVariables.map(function (code, index) {
            return {
              name: code,
              data: data[variableIdxs[code]],
              index: index,
              id: index,
              legendIndex: index
            }
          })
        };
      }
    }

    return function (config, dataset) {

      if (!dataset) {
        return null;
      }
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
    }

  }]);
