/**
 * Modified by Arnaud Jutzeler on 05/08/2016.
 */
angular
  .module("chuvApp.experiments", [
    "ngResource",
    "ui.router",
    "chuvApp.util",
    "chuvApp.components.notifications"
  ])
  .config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state("new_experiment", {
          url: "/experiment/:model_slug?variables&coVariables&groupings&filters",
          templateUrl: "scripts/app/experiments/new_experiment.html",
          controller: "NewExperimentController",
          params: {
            graph_config: null
          }
        })
        .state("experiment_details", {
          url: "/experiment/:model_slug/:experiment_uuid",
          templateUrl: "scripts/app/experiments/experiment_details.html",
          controller: "ExperimentDetailsController"
        });
    }
  ]);
