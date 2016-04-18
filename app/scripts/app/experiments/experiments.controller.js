angular.module('chuvApp.experiments').controller('ExperimentController',[
  '$scope', 'MLUtils', '$stateParams', 'Model', '$location', '$modal', function($scope, MLUtils, $stateParams, Model, $location, $modal) {
    $scope.loaded = false;

    $scope.ml_methods_by_type = {};
    $scope.shared = {
      chosen_method: null
    };
    $scope.help_is_open = true;

    $scope.type_name = function (method_name) {
      return method_name.charAt(0).toUpperCase() + method_name.slice(1) + "s";
    };

    MLUtils.list_lm_methods().forEach(function (method) {
      method.type.forEach(function (type) {
        if (!$scope.ml_methods_by_type.hasOwnProperty(type)) {
          $scope.ml_methods_by_type[type] = [];
        }
        $scope.ml_methods_by_type[type].push(method);
      })
    });

    // function to be called when query and dataset are ready
    function on_data_loaded () {

      $scope.loaded = true;

      var variable_data = $scope.dataset.data[$scope.dataset.variable[0]];

      $scope.predicting_type = MLUtils.get_datatype($scope.dataset.variable[0], variable_data);
      $scope.predictor_type = $scope.predicting_type === 'real' ? 'regressor' : 'classifier';

    }


    if ($stateParams.slug) {
      // we have a slug: load model
      Model.get({slug: $stateParams.slug}, function(result) {
        $scope.model = result;
        $scope.dataset = result.dataset;
        $scope.query = result.query;
        on_data_loaded();
      });

    } else {
      // load model from data

      // step 1: load query
      var search = $location.search();
      function map_query(category) {
        return search[category]
          ? search[category].split(",").map(function (code) { return {code: code}})
          : [];
      }

      $scope.query = {
        variables: map_query("variables"),
        groupings: map_query("groupings"),
        coVariables: map_query("coVariables"),
        filters: map_query("filters"),
        textQuery: search.query,
      }

      // step 2: load dataset
      var query = angular.copy($scope.query);

      Model.executeQuery(query).success(function (queryResult) {
        $scope.loading_model = false;
        $scope.dataset = queryResult;
        on_data_loaded();
      });

      $scope.save_model = function () {
        // pass

        $modal.open({
          templateUrl: "/scripts/app/experiments/save-model-modal.html",
          controller: ['$scope', '$state', function (child_scope, $state) {
            child_scope.do_save_model = function() {

              $scope.model = {
                title: child_scope.name,
                config: {
                  type: 'designmatrix',
                  height: 480,
                  yAxisVariables: $scope.dataset.header.slice(0, 5),
                  xAxisVariable: null,
                  title: {text: child_scope.name }
                },
                dataset: $scope.dataset,
                valid: child_scope.share,
                query: $scope.query
              };

              // save new model
              Model.save($scope.model, function (model) {
                $state.go('experiment', {slug: model.slug})
                alert("Save ok");
              }, function(){
                alert("Error on save!");
              });
            };

          }]
        })

      }

    }

    $scope.$on('experiment_started', function () {
      $scope.help_is_open = false;
    })

  }]);
