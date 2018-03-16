/**
 * Created by Michael DESIGAUD on 08/09/2015.
 */
"use strict";

angular.module("chuvApp.components.filters", []).filter("fromNow", function() {
  return function(date) {
    var dateFromServer = moment.utc(date).toISOString();
    var newDateInUTC = moment().utc().toISOString();
    return moment( dateFromServer ).from( moment(newDateInUTC) );
  };
});
