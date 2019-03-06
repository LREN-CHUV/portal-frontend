"use strict";
angular.module("chuvApp.helpdesk").directive("helpdesk", [
  "$sce",
  function($sce) {
    return {
      templateUrl: "/scripts/app/helpdesk/helpdesk.html",
      replace: true,
      scope: {
        data: "="
      },
      controller: [
        "$scope",
        function($scope) {
          var script = `
            <script>
            window.addEventListener("load", function(){
                var script = document.createElement('script');
                script.src = "https://support.humanbrainproject.eu/assets/form/form.js";
                script.id = "zammad_form_script";
                document.body.appendChild(script);
                script.addEventListener("load", function() {

                    $(function () {
                        $('#feedback-form').ZammadForm({
                            messageTitle: 'Feedback Form',
                            messageSubmit: 'Submit',
                            messageThankYou: 'Thank you for your inquiry (#%s)! We will contact you as soon as possible.'
                        });
                    });
                    var preselect = document.querySelector('[name="hbp-category"] option[value="Medical Informatics"]');
                    preselect.selected = "selected";
                });
            });
            </script>
            `;
          $scope.helpdeskForm = $sce.trustAsHtml(script);
        }
      ]
    };
  }
]);
