/**
 * Created by Florent PERINEL on 14/08/2015.
 */
'use strict';

angular.module('chuvApp.users')
  .factory('User', ['$rootScope','backendUrl','$http','$cookieStore','base64', function ($rootScope,backendUrl,$http,$cookieStore,base64) {

    var hasAgreedTos = $rootScope.hasAgreedTos = !!$cookieStore.get("tos");

    return {

      current: function () {
        return $cookieStore.get('user');
      },
      hasCurrent : function(){
          return $cookieStore.get('user') !== null && $cookieStore.get('user') !== undefined;
      },
      removeCurrent: function () {
        $cookieStore.remove('tos');
        return $cookieStore.remove('user');
      },

      get: function () {
        var promise = $http.get(backendUrl + "/user")
        promise.then(function (user_data) {
          // TODO connect to backend
          //$rootScope.hasAgreedTos = hasAgreedTos = user_data.hasAgreedTos;
        })
        return promise;
      },

      hasAgreedTos: function () {
        return !!hasAgreedTos;
      },
      agreeTos: function () {
        // TODO: post
        var promise = $http.post(backendUrl + "/user?agreeNDA=true");
        promise.then(function () {
          $cookieStore.put("tos", $rootScope.hasAgreedTos = hasAgreedTos = true);
        });
        return promise;
      }

    };

  }]);
