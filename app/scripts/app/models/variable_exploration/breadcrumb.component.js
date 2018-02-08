"use strict";
angular
    .module("chuvApp.models")
    .component("breadcrumb", {
        bindings: {
            getFocusedVariable: '<'
        },
        require: {
        },
        controller:[
            'Variable',
            function(Variable){
                this.$onChanges = () => {
                    if (_.has(this.getFocusedVariable, 'code')){
                        Variable
                            .getBreadcrumb(this.getFocusedVariable.code)
                            .then(breadcrumb => {
                                //breadcrumb.shift();//removes "root" node
                                this.breadcrumb = breadcrumb;
                            });
                    }

                }
            }    
        ],       
        templateUrl: 'scripts/app/models/variable_exploration/breadcrumb.html'
    });
    