/**
 * Created by Michael DESIGAUD on 17/08/2015.
 */
'use strict';

describe('Controller: ModelController', function () {

    var ModelController,
        scope,
        rootScope,
        httpMock,
        stateParams,
        ModelService,
        _backendUrl,
        state,
        translate;

    // load the controller's module
    beforeEach(module('chuvApp'));
    beforeEach(module('chuvApp.models'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope,$translate,$httpBackend,backendUrl,$stateParams,$state) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        translate = $translate;
        stateParams = $stateParams;
        state = $state;
        httpMock = $httpBackend;
        _backendUrl = backendUrl;
        ModelController = $controller('ModelController', {
            $scope: scope
        });

    }));

});