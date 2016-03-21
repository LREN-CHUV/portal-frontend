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
          //yAxis: {
          //  title: null
          //}
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
      config.hasXAxis = false;

      var variables = _.filter(
        dataset.header,
        function (header) {
          return config.yAxisVariables.indexOf(header) >= 0;
        }
      );

      var mins = [],
        maxes = [];

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
              data = dataset.data[variables[idx1]];
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

      function orderBy(orderAxis, data) {
        if (!orderAxis)
          return data;

        var sortedData = _.unzip(
          _.sortBy(
            _.unzip(data.concat([orderAxis])),
            data.length
          )
        );
        sortedData.pop();
        return sortedData;
      }


      return function (config, dataset) {
        config.hasXAxis = true;

        var xAxisVariableIdx,
          variableIdxs = {},
          data = dataset.header.map(function (name, index) {
            if (name === config.xAxisVariable)
              xAxisVariableIdx = index;
            variableIdxs[name] = index;
            return aToI(dataset.data[name]);
          });
        data = orderBy(data[xAxisVariableIdx], data);

        return {
          xAxis: {
            code: config.xAxisVariable,
            title: { text: config.xAxisVariable},
            categories: data[xAxisVariableIdx]
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
        column: buildRegularChart("column"),
        scatter: buildRegularChart("scatter"),
        line: buildRegularChart("line")
      }[config.type] || angular.identity)(config, dataset);
    }

  }]);
