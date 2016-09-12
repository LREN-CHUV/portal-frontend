angular.module('chuvApp.experiments')

/**
 *
 * TODO In the future separate method-result from validation-result:
 * TODO For a given method we might want to display a specific view followed by the generic validation infos...
 *
 * In function of type of method get the right result template...
 */
  .directive("methodResult",
    [
      '$http',
      function (
        $http
      ) {

        // TODO package all the templates at once...
        var getTemplate = function(type) {
          var templateUrl = 'default-results.html';
          switch(type) {
            case 'linearRegression':
              templateUrl = 'linear-regression-results';
              break;
            case 'anova':
              templateUrl = 'anova-results.html';
              break;
            case 'binary_classification':
              templateUrl = 'binary-classification-results.html';
              break;
            case 'classification':
              templateUrl = 'default-classification-results.html';
              break;
            case 'regression':
              templateUrl = 'default-regression-results.html';
              break;
          }

          return $http.get('scripts/app/experiments/results/' + templateUrl);
        };

        var linker = function($scope, element) {
          scope.rootDirectory = 'images/';

          // TODO package all the templates at once...
          getTemplate($scope.data.type).then(function (data) {
            element.html(data).show();
            $compile(element.contents())($scope);
          });
        };

        return {
          restrict: "E",
          link: linker,
          scope: {
            data: '='
          }
        };
      }]
  );
