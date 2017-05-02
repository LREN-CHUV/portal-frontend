/**
 * Created by Arnaud Jutzeler on 05/08/2016.
 */
angular.module("chuvApp.components.notifications").provider("notifications", [
  function NotificationService() {
    "use strict";
    var provider = this, default_timeout = 5000; // 5 seconds
    this.notifications = [];

    this.$get = [
      "$timeout",
      function($timeout) {
        var notifications = {
          success: function notify_success(message) {
            notifications.notify(message, "success");
          },
          info: function notify_info(message) {
            notifications.notify(message, "info");
          },
          warning: function notify_warning(message) {
            notifications.notify(message, "warning");
          },
          error: function notify_error(message) {
            notifications.notify(message, "danger");
          },
          notify: function notify(message, level) {
            var promise = $timeout(function() {
              provider.notifications.pop();
            }, default_timeout);

            provider.notifications.unshift({
              // prepend
              message: message,
              type: level,
              dismiss: function() {
                provider.notifications.pop();
                $timeout.cancel(promise);
              }
            });
          },
          $get: function() {
            return provider.notifications;
          }
        };
        return notifications;
      }
    ];
    return provider;
  }
]);

function NotificationCtrl($scope, notifications) {
  "use strict";
  $scope.notifications = notifications.$get();
}

NotificationCtrl.$inject = ["$scope", "notifications"];
angular
  .module("chuvApp.components.notifications")
  .controller("NotificationCtrl", NotificationCtrl);
