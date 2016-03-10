/**
 * Created by Michael DESIGAUD on 26/08/2015.
 */

angular.module('chuvApp.util',['ui.bootstrap'])
  .config(['$httpProvider',function ($httpProvider) {
    //Default timeout
    $httpProvider.defaults.timeout = 5000;

    /**
     * Send the user to the login page if he tried to access a forbidden service
     * @param {object} data
     * @param {number} status
     */
    function logoutOnForbidden(data, status) {
      if (status === 401 && document.getElementById("logout-link") !== undefined) {
        //forces logout-login redirect;
        setTimeout(function () {
          document.getElementById("logout-link").click();
        }, 0);
      }
    }

    $httpProvider.interceptors.unshift(['$q', function ($q) {
      return {
        responseError: function (rejection) {
          if ((rejection.status === 401 || rejection.status === 403) && document.getElementById("logout-link") !== undefined) {
            //forces logout-login redirect;
            setTimeout(function () {
              document.getElementById("logout-link").click();
            }, 0);
          }
          return $q.reject(rejection);
        }
      };
    }]);

  }]);
