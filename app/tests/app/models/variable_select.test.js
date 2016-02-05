describe('Unit testing great quotes', function() {
    var $compile,
        $rootScope,
        $httpBackend,
        _backendUrl;

    var variableMock = [{
            "group": {
                "code": "polymorphism",
                "label": "polymorphism",
                "groups": [{
                    "code": "APOE",
                    "label": "APOE",
                    "groups": []
                }]
            },
            "code": "APOE4",
            "label": "APOE4",
            "type": "I",
            "length": 1,
            "minValue": 0,
            "maxValue": 2,
            "isVariable": false,
            "isGrouping": true,
            "isCovariable": true,
            "isFilter": false,
            "values": []
        }],
        groupMock = {
            "code": "root",
            "label": "root",
            "groups": [{
                "code": "polymorphism",
                "label": "polymorphism",
                "groups": [{
                    "code": "APOE",
                    "label": "APOE",
                    "groups": []
                }]
            }]
        },
        statMock = [
            {
                "dataType": "SummaryStatistics",
                "code": "APOE4",
                "count": 1642,
                "min": 0,
                "max": 2,
                "average": 0.510353228,
                "std": 0.648592906
            },
            {
                "code": "APOE",
                "dataType": "DatasetStatistics",
                "dataset": {
                    "data": {
                        "header": [
                            "0",
                            "1",
                            "2"
                        ],
                        "shape": "vector",
                        "value": [
                            930,
                            541,
                            124
                        ]
                    },
                    "name": "Count APOE values"
                },
                "label": "Breakdown by value"
            },
            {
                "code": "APOE",
                "dataType": "DatasetStatistics",
                "dataset": {
                    "data": {
                        "categories": [
                            "0",
                            "0",
                            "1",
                            "1",
                            "2",
                            "2",
                            "NA"
                        ],
                        "header": [
                            "ADNI1",
                            "ADNI2",
                            "ADNI1",
                            "ADNI2",
                            "ADNI1",
                            "ADNI2",
                            "ADNI2"
                        ],
                        "shape": "vector",
                        "value": [
                            694,
                            287,
                            408,
                            112,
                            101,
                            14,
                            3
                        ]
                    },
                    "name": "Count APOE values"
                },
                "label": "Count by provenance"
            }
        ];

    // Load the myApp module, which contains the directive
    beforeEach(module('karmaTemplates'));
    beforeEach(module('chuvApp'));
    beforeEach(module('chuvApp.models'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _$templateCache_, backendUrl){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        _backendUrl = backendUrl;

        $httpBackend.when('GET', 'i18n/en/common.json').respond(200);
        $httpBackend.when('GET', 'i18n/fr/common.json').respond(200);
        $httpBackend.when('GET', 'i18n/en/header.json').respond(200);
        $httpBackend.when('GET', 'i18n/fr/header.json').respond(200);

        _$templateCache_.get("/scripts/app/models/variable_exploration/variable_selection.html");
    }));

    it('Replaces the element with the appropriate content', function() {
        // Compile a piece of HTML containing the directive
        var scope = $rootScope.$new();

        var element = $compile("<variable-selection></variable-selection>")(scope);

        $httpBackend.expectGET(_backendUrl+'/variables').respond(variableMock);
        $httpBackend.expectGET(_backendUrl+'/groups').respond(groupMock);

        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        expect(element.text()).toContain("Loading");

        $httpBackend.flush();

        expect(element.text()).not.toContain("Loading");
        expect(scope.allVariables).not.toBe(undefined);
        expect(scope.allVariables.length).toBe(1);
        expect(element.text()).toContain("Please select a variable on the left");
        expect(element.select("input").length).toBe(1);

        scope.shared.selected_variable = scope.allVariables[0];
        $httpBackend.expectGET("/mocks/stats/APOE4/response.json").respond(statMock);
        $rootScope.$digest();

        expect(element.text()).toContain("Measurements");

        expect(element.select("a.btn").length).toBe(1);
    });
});
