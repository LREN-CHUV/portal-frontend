/**
 * Created by Florent PERINEL on 14/08/2015.
 */
'use strict';

angular.module('chuvApp.users')
  .factory('User', [
    '$rootScope',
    'backendUrl',
    '$http',
    '$cookies',
    function (
      $rootScope,
      backendUrl,
      $http,
      $cookies
    ) {

    var user_oauth_obj,
      user_backend_obj,
      user_promise;

    return {

      current: function () {
        return user_backend_obj;
      },
      hasCurrent : function(){
          return !!user_backend_obj;
      },

      get: function () {
        return user_promise || (user_promise =
            $http.get(backendUrl + "/user")
              .then(function (user_data) {
                user_oauth_obj = user_data.data;
                var promise = $http.get(backendUrl + "/users/" + user_data.data.userAuthentication.details.preferred_username);
                promise.then(function (user_data) {
                  user_backend_obj = user_data.data;
                  $rootScope.hasAgreedTos = user_backend_obj.agreeNDA;
                });
                return promise;
              })
          );
      },

      hasAgreedTos: function () {
        return user_backend_obj && user_backend_obj.agreeNDA;
      },
      agreeTos: function () {
        var promise = $http.post(backendUrl + "/user?agreeNDA=true");
        promise.then(function () {
          $rootScope.hasAgreedTos = user_backend_obj.agreeNDA = true;
        });
        return promise;
      },

      logout: function () {
        $rootScope.user = null;
        user_promise = user_backend_obj = $rootScope.hasAgreedTos = false;
        $http.post(backendUrl + "/logout");
      }

    };

  }]);
