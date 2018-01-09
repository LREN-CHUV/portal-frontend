/**
 * Created by Michael DESIGAUD on 10/09/2015.
 */
'use strict';

angular.module("chuvApp.util").factory("ModalUtil", [
  "$uibModal",
  function($uibModal) {
    return {
      showModal: function(scope, article, okCallback) {
        scope.opts = {
          backdrop: true,
          backdropClick: true,
          dialogFade: false,
          keyboard: true,
          size: "lg",
          controller: "ArticleModalController",
          templateUrl: "scripts/app/articles/article-modal.html",
          resolve: {}
        };

        scope.opts.resolve.item = function() {
          // pass resident to Dialog
          return angular.copy({ article: article, okCallback: okCallback });
        };
        $uibModal.open(scope.opts);
      }
    };
  }
]);
