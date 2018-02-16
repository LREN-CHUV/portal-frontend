/**
 * Created by Florent PERINEL on 12/08/2015.
 */
"use strict";

angular
  .module("chuvApp.articles")
  /**
 * Show and form articles controller
 */
  .controller("ArticleController", [
    "$scope",
    "$translatePartialLoader",
    "$translate",
    "$location",
    "$stateParams",
    "Article",
    "User",
    "Model",
    "backendUrl",
    "ModalUtil",
    "MLUtils",
    "$q",
    "notifications",
    "$filter",
    function(
      $scope,
      $translatePartialLoader,
      $translate,
      $location,
      $stateParams,
      Article,
      User,
      Model,
      backendUrl,
      ModalUtil,
      MLUtils,
      $q,
      notifications,
      $filter
    ) {
      /**
       * Initialize controller
       */
      $scope.init = function() {
        $translatePartialLoader.addPart("articles");
        $translatePartialLoader.addPart("requests");
        $translate.refresh();
        $scope.loadArticle();
        $scope.loadModels();
      };

      $scope.query = null;

      /**
       * Return true if is a creation action
       * @returns {boolean}
       */
      $scope.isNew = function() {
        return $stateParams.slug == null && $stateParams.action == null;
      };

      /**
       * Return the action code
       * @returns {boolean}
       */
      $scope.isReadOnly = function() {
        return $stateParams.action === "show";
      };

      /**
       * Save article
       */
      $scope.save = function() {
        if (!$scope.article.title) {
          notifications.warning("You need a title for your article!");
          return;
        }
        if (!$scope.article.abstract) {
          notifications.warning("You need an abstract for your article!");
          return;
        }
        $scope.article.date = new Date().toISOString();
        $scope.article.status = $scope.publishArticle ? "published" : "closed";
        if ($scope.isNew()) {
          $scope.article = Article.save($scope.article, function() {
            $location.path("/home");
          });
        } else {
          $scope.article = Article.update($scope.article, function() {
            $location.path("/home");
          });
        }
      };

      /**
       * Load article object in controller
       */
      $scope.loadArticle = function() {
        if (!$scope.isNew()) {
          $scope.article = Article.get({ slug: $stateParams.slug });

          $scope.article.$promise.then(function() {
            $scope.publishArticle = $scope.article.status === "published";
          });
        } else {
          $scope.article = {
            status: "draft"
          };
        }
      };

      /**
       * Load models objects in controller
       */
      $scope.loadModels = function(params) {
        if (!params) {
          params = { team: 1 };
        }
        $scope.models = Model.query(params);
        $scope.experiments = MLUtils.list_available_experiments();
        $q.all($scope.models.$promise, $scope.models.$promise).then(function() {
          $scope.model_and_experiments = $filter("orderBy", "-createdAt")(
            $scope.experiments
              .map(function(experiment) {
                experiment.createdAt = Date.parse(experiment.created);
                return experiment;
              })
              .concat($scope.models)
          );
        });
      };

      /**
         * push pdf file to drop box
         * @param article
         */
      $scope.saveToDropbox = function(article) {
        var options = {
          // Success is called once all files have been successfully added to the user's
          // Dropbox, although they may not have synced to the user's devices yet.
          success: function() {
            // Indicate to the user that the files have been saved.
            notifications.success("Success! Files saved to your Dropbox.");
          },
          // Error is called in the event of an unexpected response from the server
          // hosting the files, such as not being able to find a file. This callback is
          // also called if there is an error on Dropbox or if the user is over quota.
          error: function(errorMessage) {
            notifications.error(errorMessage);
          }
        };
        // local url not working for dev=> var baseUrl="http://chuv-backend.redfroggy.fr";
        var baseUrl = backendUrl;

        var slug = article.slug;
        // todo used apikey of current user
        Dropbox.save(
          baseUrl + "/articles/" + slug + ".pdf?apikey=adminapikey",
          slug + ".pdf",
          options
        );
      };

      $scope.showModal = function(article) {
        ModalUtil.showModal($scope, article);
      };

      $scope.onChangeMine = function(checked) {
        $scope.loadModels({ team: checked ? 0 : 1, own: checked ? 1 : 0 });
      };

      // Init
      $scope.init();
    }
  ]);

angular.module("chuvApp.articles").controller("ArticleModalController", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "item",
  function($scope, $uibModalInstance, $uibModal, item) {
    $scope.article = item.article;

    $scope.closeModal = function() {
      $uibModalInstance.dismiss("cancel");
    };
  }
]);

angular.module("chuvApp.articles").controller("ArticlesController", [
  "$scope",
  "Article",
  "ModalUtil",
  "User",
  function($scope, Article, ModalUtil, User) {
    $scope.articles = Article.query({
      team: 1,
      own: 0,
      status: "published",
      valid: 1
    });

    $scope.showModal = function(article) {
      ModalUtil.showModal($scope, article);
    };

    /**
     * Return true if object has been created by current user
     * @param obj
     * @returns {boolean}
     */
    $scope.isMine = function(obj) {
      return User.hasCurrent() ?
        obj.createdBy.username == User.current().username :
        false;
    };

    $scope.isAuthorized = function(article) {
      return $scope.isMine(article);
    };
  }
]);
