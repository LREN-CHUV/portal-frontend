var appConfig = require("./app-config.json");

var appScripts = [
  "./" + appConfig.app + "/scripts/app/app.js",
  "./" + appConfig.app + "/scripts/app/app.config.js",

  "./" + appConfig.app + "/scripts/app/header/header.module.js",
  "./" + appConfig.app + "/scripts/app/header/header.controller.js",
  "./" + appConfig.app + "/scripts/app/footer/footer.module.js",
  "./" + appConfig.app + "/scripts/app/footer/footer.controller.js",
  "./" + appConfig.app + "/scripts/app/home/home.module.js",
  "./" + appConfig.app + "/scripts/app/home/home.router.js",
  "./" + appConfig.app + "/scripts/app/home/home.controller.js",
  "./" + appConfig.app + "/scripts/app/home/tos.controller.js",
  "./" + appConfig.app + "/scripts/app/hbpapps/hbpapps.module.js",
  "./" + appConfig.app + "/scripts/app/hbpapps/hbpapps.controller.js",
  "./" + appConfig.app + "/scripts/app/articles/articles.module.js",
  "./" + appConfig.app + "/scripts/app/articles/articles.service.js",
  "./" + appConfig.app + "/scripts/app/articles/articles.controller.js",
  "./" + appConfig.app + "/scripts/app/users/users.module.js",
  "./" + appConfig.app + "/scripts/app/users/users.controller.js",
  "./" + appConfig.app + "/scripts/app/users/users.service.js",
  "./" + appConfig.app + "/scripts/app/requests/requests.module.js",
  "./" + appConfig.app + "/scripts/app/requests/requests.service.js",
  "./" + appConfig.app + "/scripts/app/requests/requests.controller.js",
  "./" + appConfig.app + "/scripts/app/models/model.module.js",
  "./" + appConfig.app + "/scripts/app/models/model.router.js",
  "./" + appConfig.app + "/scripts/app/models/model.controller.js",
  "./" + appConfig.app + "/scripts/app/models/model.service.js",
  "./" + appConfig.app + "/scripts/app/models/debounce.service.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/exploration.controller.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/variable_description.directive.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/variable_statistics.directive.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/variable_configuration.directive.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/circle_packing.directive.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/breadcrumb.component.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/varcounter.component.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/variable.component.js",
  "./" + appConfig.app + "/scripts/app/models/review/review.controller.js",
  "./" + appConfig.app + "/scripts/app/models/review/chart.controller.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/review/configuration.controller.js",
  "./" + appConfig.app + "/scripts/app/models/review/criteria.controller.js",
  "./" + appConfig.app + "/scripts/app/models/review/dataset.controller.js",
  "./" + appConfig.app + "/scripts/app/models/review/estimation.controller.js",
  "./" + appConfig.app + "/scripts/app/models/review/footer.controller.js",
  "./" + appConfig.app + "/scripts/components/criteria/criteria.module.js",
  "./" + appConfig.app + "/scripts/components/criteria/criteria.service.js",
  "./" + appConfig.app + "/scripts/components/criteria/groups.service.js",
  "./" + appConfig.app + "/scripts/components/criteria/datasets.service.js",
  "./" + appConfig.app + "/scripts/components/criteria/variables.service.js",
  "./" + appConfig.app + "/scripts/components/config/config.module.js",
  "./" + appConfig.app + "/scripts/components/config/config.service.js",
  "./" +
    appConfig.app +
    "/scripts/components/criteria/chained-select.directive.js",
  "./" + appConfig.app + "/scripts/components/util/util-module.js",
  "./" + appConfig.app + "/scripts/components/util/chart-util.service.js",
  "./" + appConfig.app + "/scripts/components/util/modal-util.service.js",
  "./" + appConfig.app + "/scripts/components/header/header-module.js",
  "./" + appConfig.app + "/scripts/components/header/header-scroll.js",
  "./" + appConfig.app + "/scripts/app/experiments/experiments.module.js",
  "./" + appConfig.app + "/scripts/app/experiments/experiments.controller.js",
  "./" + appConfig.app + "/scripts/app/experiments/experiments.services.js",
  "./" + appConfig.app + "/scripts/app/experiments/experiments.directives.js",
  "./" +
    appConfig.app +
    "/scripts/app/experiments/results/results.directives.js",
  "./" + appConfig.app + "/scripts/components/button/button-module.js",
  "./" + appConfig.app + "/scripts/components/button/button-rounded.js",
  "./" + appConfig.app + "/scripts/components/button/carrousel-button.js",
  "./" + appConfig.app + "/scripts/components/checkbox/checkbox-module.js",
  "./" + appConfig.app + "/scripts/components/checkbox/icheckbox.js",
  "./" + appConfig.app + "/scripts/components/date/from-now.filter.js",
  "./" + appConfig.app + "/scripts/components/carrousel/carrousel-module.js",
  "./" + appConfig.app + "/scripts/components/carrousel/carrousel.js",
  "./" +
    appConfig.app +
    "/scripts/components/notifications/notifications-module.js",
  "./" + appConfig.app + "/scripts/components/notifications/notifications.js",
  "./" + appConfig.app + "/scripts/app/mydata/mydata.module.js",
  "./" + appConfig.app + "/scripts/app/mydata/mydata.controller.js",
  "./" + appConfig.app + "/scripts/app/profile/profile.module.js",
  "./" + appConfig.app + "/scripts/app/profile/profile.controller.js",
  "./" + appConfig.app + "/scripts/components/scrollbar/scrollbar-module.js",
  "./" + appConfig.app + "/scripts/components/scrollbar/scrollbar.js",
  "./" + appConfig.app + "/scripts/app/intro/intro.module.js",
  "./" + appConfig.app + "/scripts/app/intro/intro.controller.js",
  "./" + appConfig.app + "/scripts/components/widget/widget.module.js",
  "./" + appConfig.app + "/scripts/components/widget/widget.service.js",
  "./" + appConfig.app + "/scripts/components/toolbar/toolbar.module.js",
  "./" + appConfig.app + "/scripts/components/toolbar/toolbar.js",
  "./" + appConfig.app + "/scripts/components/hightlight/hightlight.filter.js",
  "./" +
    appConfig.app +
    "/scripts/app/models/variable_exploration/available_methods.component.js",
  "./" +
    appConfig.app +
    "/scripts/components/export-to-png/export-to-png.module.js",
  "./" +
    appConfig.app +
    "/scripts/components/export-to-png/export-to-png.directive.js"
];

module.exports = appScripts;
