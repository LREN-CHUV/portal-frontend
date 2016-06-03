angular.module('chuvApp.hbpapps').controller('HBPAppsController',
  ['$scope', '$http', '$filter', 'backendUrl', function($scope, $http, $filter, backendUrl){

    var filterFilter = $filter('filter');

    $scope.loading = true;
    $scope.all_apps = [];
    $scope.apps_by_categories = [];
    $scope.shared = {
      search: "",
      rating: {}
    };

    $http.get(backendUrl + "/apps").then(
      function onGetAppsSuccess (response) {
        $scope.loading = false;

        $scope.all_apps = response.data;
        update_apps_by_category();
        setup_rating_watches()
      },
      function onGetAppsFail () {
        $scope.error = true;
        $scope.loading = false;
      }
    )

    function setup_rating_watches() {
      $scope.all_apps.forEach(function (app) {
        $scope.shared.rating[app.id] = app.ratingSum * 1.0 / app.ratingCount;
        $scope.$watch(
          'shared.rating[' + app.id + "]",
          function update_user_rating_on_rating_change(rating) {
            if (
              !!rating
              && rating != (app.ratingSum * 1.0 / app.ratingCount)
            )
              $http.post(backendUrl + "/apps/" + app.id + "/vote/" + rating)
          }
        )
      })
    }

    function update_apps_by_category() {
      var search = $scope.shared.search.split(" ");
      var filtered_apps = _.reduce(search, filterFilter, $scope.all_apps);

      var apps_by_category = {};

      filtered_apps.forEach(function (app) {
        apps_by_category[app.category] = apps_by_category[app.category] || [];

        apps_by_category[app.category].push(app);
      });

      $scope.apps_by_categories = _.pairs(apps_by_category).map(function (category_and_apps) {
        return {
          category: category_and_apps[0],
          apps: category_and_apps[1]
        }
      })
    }

    $scope.$watch("shared.search", update_apps_by_category);

  }]);
