/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';
angular.module('chuvApp.models')
  .controller('ModelsController', ['$scope', '$translatePartialLoader', '$translate', '$rootScope', 'Model', 'backendUrl', '$attrs', 'WidgetService', 'User', "ChartUtil",
    function ($scope, $translatePartialLoader, $translate, $rootScope, Model, backendUrl, $attrs, WidgetService, User, ChartUtil) {

      $translatePartialLoader.addPart('model');
      $translate.refresh();

      var params = {};
      if ($attrs.params !== undefined) {
        params = angular.fromJson($attrs.params);
      }

      $scope.getSvgUrl = function (model) {
        return backendUrl + "/models/" + model.slug + ".svg";
      };

      /**
       * Return true if object has been created by current user
       * @param obj
       * @returns {boolean}
       */
      $scope.isMine = function (obj) {
        return obj.createdBy.username == User.current().username;
      };

      Model.getList(params).then(function (response) {
        $scope.models = response.data;
        WidgetService.make();
      });

      $scope.get_config = function (model) {
        var config = angular.copy(model.config);
        config.height = 300;
        config.width = undefined;
        config.title = null;
        return ChartUtil(config, model.dataset);
      }
    }]);
