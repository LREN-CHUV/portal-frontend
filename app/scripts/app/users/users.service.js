/**
 * Created by Florent PERINEL on 14/08/2015.
 */
'use strict';

angular.module('chuvApp.users')
  .factory('User', ['$rootScope','backendUrl','$http', function ($rootScope,backendUrl,$http) {

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
                })
                return promise;
              })
          );
      },

      hasAgreedTos: function () {
        return user_backend_obj && user_backend_obj.agreeNDA;
      },
      agreeTos: function () {
        return $http.post(backendUrl + "/user?agreeNDA=true");
        $rootScope.hasAgreedTos = user_backend_obj.agreeNDA = true;
      },

      logout: function () {
        $rootScope.user = null;
        user_promise = user_backend_obj = user_promise = $rootScope.hasAgreedTos = false;
        $http.post(backendUrl+'/logout');
      }

    };

  }]);
