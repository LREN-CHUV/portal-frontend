/**
 * Created by Michael DESIGAUD on 12/08/2015.
 */

'use strict';
angular.module('chuvApp.models')
  .controller('ModelsController', ['$scope', '$translatePartialLoader', '$translate', '$rootScope', 'Model', 'backendUrl', '$attrs', 'WidgetService', 'User',
    function ($scope, $translatePartialLoader, $translate, $rootScope, Model, backendUrl, $attrs, WidgetService, User) {

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
    }]);
