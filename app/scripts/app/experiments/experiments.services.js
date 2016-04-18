angular.module('chuvApp.util')
  .factory('MLUtils', ['ChartUtil', function (ChartUtil) {

    var datatypes_per_code = {};


    function compute_data_types (dataset) {

      var diff_count = _.uniq(dataset).length;
      if (diff_count > 10) {

        if (_.any(function (val) { return isNaN(+val);})) {
          return "polynomial"
        }
        return "real"
      }

      return diff_count <= 2 ? "binomial" : "polynomial";

    }

    return {
      list_lm_methods: function () {

        // to generate the help you want:
        // 1- go to the wikipedia page of your interest and copy the part your interested in (the source!)
        // 2- go to http://pandoc.org/try/ and convert from mediawiki to html 5
        // 3- remove the footnotes
        // 3- apply the following regex replacements:
        //    href="([\w\-_]+)"   =>   href=\\"https://en.wikipedia.org/wiki/$1\\" target=\\"_blank\\"
        //    ^(.*)$    =>    "$1\\n" +
        //    \w+="(.+?)"     =>    <nothing>


        return [{
          name: "anova",
          display: "Anova",
          type: ['regressor'],
          parameters: [],
        }, {
          name: "lm",
          display: "General Linear Regression",
          type: ['regressor'],
          parameters: [],
        }, {
          name: "knn",
          display: "K-Nearest Neighbours",
          type: ['classifier', 'regressor'],
          parameters: [{
            name: "k",
            display: "k",
            default_value: 5,
            description: "The number of closest neighbours to take into consideration. Typical values range from 2 to 10."
          }],
          help:"<p>In <a href=\"https://en.wikipedia.org/wiki/pattern_recognition\" target=\"_blank\" >pattern recognition</a>, the <strong><em>k</em>-Nearest Neighbors algorithm</strong> (or <strong><em>k</em>-NN</strong> for short) is a <a href=\"https://en.wikipedia.org/wiki/Non-parametric_statistics\" target=\"_blank\" >non-parametric</a> method used for <a href=\"https://en.wikipedia.org/wiki/statistical_classification\" target=\"_blank\" >classification</a> and <a href=\"https://en.wikipedia.org/wiki/regression_analysis\" target=\"_blank\" >regression</a>. In both cases, the input consists of the <em>k</em> closest training examples in the <a href=\"https://en.wikipedia.org/wiki/feature_space\" target=\"_blank\" >feature space</a>. The output depends on whether <em>k</em>-NN is used for classification or regression:</p>\n" +
"<ul>\n" +
"<li>In <em>k-NN classification</em>, the output is a class membership. An object is classified by a majority vote of its neighbors, with the object being assigned to the class most common among its <em>k</em> nearest neighbors (<em>k</em> is a positive <a href=\"https://en.wikipedia.org/wiki/integer\" target=\"_blank\"  >integer</a>, typically small). If <em>k</em> = 1, then the object is simply assigned to the class of that single nearest neighbor.</li>\n" +
"</ul>\n" +
"<ul>\n" +
"<li>In <em>k-NN regression</em>, the output is the property value for the object. This value is the average of the values of its <em>k</em> nearest neighbors.</li>\n" +
"</ul>\n" +
"<p><em>k</em>-NN is a type of <a href=\"https://en.wikipedia.org/wiki/instance-based_learning\" target=\"_blank\" >instance-based learning</a>, or <a href=\"https://en.wikipedia.org/wiki/lazy_learning\" target=\"_blank\" >lazy learning</a>, where the function is only approximated locally and all computation is deferred until classification. The <em>k</em>-NN algorithm is among the simplest of all <a href=\"https://en.wikipedia.org/wiki/machine_learning\" target=\"_blank\" >machine learning</a> algorithms.</p>\n" +
"<p>Both for classification and regression, it can be useful to assign weight to the contributions of the neighbors, so that the nearer neighbors contribute more to the average than the more distant ones. For example, a common weighting scheme consists in giving each neighbor a weight of 1/<em>d</em>, where <em>d</em> is the distance to the neighbor.<sup>2</sup></p>\n" +
"<p>The neighbors are taken from a set of objects for which the class (for <em>k</em>-NN classification) or the object property value (for <em>k</em>-NN regression) is known. This can be thought of as the training set for the algorithm, though no explicit training step is required.</p>\n" +
"<p>A shortcoming of the <em>k</em>-NN algorithm is that it is sensitive to the local structure of the data. The algorithm has nothing to do with and is not to be confused with <a href=\"https://en.wikipedia.org/wiki/k-means\" target=\"_blank\" ><em>k</em>-means</a>, another popular <a href=\"https://en.wikipedia.org/wiki/machine_learning\" target=\"_blank\" >machine learning</a> technique.</p>\n"
        }, {
          name: "nb",
          display: "Naive Bayes",
          type: ['classifier'],
          parameters: [],
        }]
      },
      get_datatype: function (code, dataArray) {
        if (!datatypes_per_code.hasOwnProperty(code)) {
          datatypes_per_code[code] = compute_data_types(dataArray);
        }
        return datatypes_per_code[code];
      },
      can_use_datatype_for_method_as_feature: function (datatype, method_name) {
        // for now feature don't matter, everything is possible
        return true;
        //var possible_features = {
        //  anova: ["real", "binomial", "polynomial"],
        //  lm: ["real", "binomial", "polynomial"],
        //  knn: ["real", "binomial", "polynomial"],
        //  nb: ["real", "binomial", "polynomial"],
        //}[method_name]
        //return possible_features && possible_features.indexOf(datatype) >= 0;
      },
      can_use_datatype_for_method_as_variable: function (datatype, method_name) {
        var possible_features = {
          anova: ["real"],
          lm: ["real"],
          knn: ["real", "binomial", "polynomial"],
          nb: ["binomial", "polynomial"],
        }[method_name]
        return possible_features && possible_features.indexOf(datatype) >= 0;
      },
    }
  }]);
