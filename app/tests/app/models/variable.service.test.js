"use strict";

describe("Service: Variable ", function() {
  beforeEach(module("app.config"));
  beforeEach(module("chuvApp.components.criteria"));

  var Variable, $resource, $http, $cacheFactory, $q, $httpBackend;
  var makeVariableService;

  beforeEach(function() {
    jasmine.addMatchers({
      toEqualData: function() {
        return {
          compare: function(actual, expected) {
            return { pass: angular.equals(actual, expected) };
          }
        };
      }
    });
  });

  beforeEach(
    inject(function(
      _$resource_,
      backendUrl,
      _$http_,
      _$cacheFactory_,
      _$q_,
      _Variable_,
      _$httpBackend_
    ) {
      $resource = _$resource_;
      $http = _$http_;
      $cacheFactory = _$cacheFactory_;
      $q = _$q_;
      Variable = _Variable_;
      $httpBackend = _$httpBackend_;
    })
  );

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("Should return the whole hierarchical data when hierarchy() is called", function(
    done
  ) {
    $httpBackend
      .expectGET("http://localhost:8080/services/variables/hierarchy")
      .respond(getMockHierarchy());

    Variable.hierarchy().then(function(data) {
      expect(data).toEqualData(getMockHierarchy());
      done();
    });

    $httpBackend.flush();
  });

  it("Should return  the whole hierarchical data from cache when hierarchy() is called is second time", function(
    done
  ) {
    $httpBackend
      .expectGET("http://localhost:8080/services/variables/hierarchy")
      .respond(getMockHierarchy());

    Variable.hierarchy().then(function(data) {
      Variable.hierarchy().then(function(data2) {
        expect(data2).toEqualData(getMockHierarchy());
        done();
      });
    });

    $httpBackend.flush();
  });

  it("Should return the variable name *Right Hippocampus* when getVariableData is called with the code *righthippocampus*", function(
    done
  ) {
    $httpBackend
      .expectGET("http://localhost:8080/services/variables/hierarchy")
      .respond(getMockHierarchy());

    Variable.getVariableData("righthippocampus").then(function(data) {
      expect(data.data.label).toEqualData("Right Hippocampus");
      done();
    });

    $httpBackend.flush();
  });

  it("Should return the Breadcrumb (or Path) to a variable (each node traversed from root) when getBreadcrumb is called with the code *righthippocampus*", function(
    done
  ) {
    var target = [
      { label: "/", code: "root", childsLength: 3 },
      { label: "Brain Anatomy", code: "brain_anatomy", childsLength: 2 },
      {
        label: "Grey matter volume",
        code: "grey_matter_volume",
        childsLength: 3
      },
      { label: "Limbic", code: "limbic", childsLength: 0 },
      { label: "Right Hippocampus", code: "righthippocampus", childsLength: 0 }
    ];
    $httpBackend
      .expectGET("http://localhost:8080/services/variables/hierarchy")
      .respond(getMockHierarchy());

    Variable.getBreadcrumb("righthippocampus").then(function(data) {
      expect(data).toEqualData(target);
      done();
    });

    $httpBackend.flush();
  });

  it("Should return a collection of object detailing the code and variable count of sub categories when getSubCategoryVariableCounter is called with the code *brain_anatomy*", function(
    done
  ) {
    var target = [
      { code: "csf_volume", counter: 2 },
      { code: "grey_matter_volume", counter: 9 }
    ];

    $httpBackend
      .expectGET("http://localhost:8080/services/variables/hierarchy")
      .respond(getMockHierarchy());

    Variable.getSubCategoryVariableCounter("brain_anatomy").then(function(
      data
    ) {
      expect(data).toEqualData(target);
      done();
    });

    $httpBackend.flush();
  });
});

function getMockHierarchy() {
  var mockHierarchy = {
    code: "root",
    label: "/",
    groups: [
      {
        code: "genetic",
        label: "Genetic",
        groups: [
          {
            code: "polymorphism",
            label: "polymorphism",
            variables: [
              {
                code: "apoe4",
                type: "polynominal",
                label: "ApoE4",
                sql_type: "int",
                description: "Apolipoprotein E (APOE) e4 allele: is the strongest risk factor for Late Onset Alzheimer Disease (LOAD). At least one copy of APOE-e4 ",
                methodology: "adni-merge",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs3818361_t",
                type: "polynominal",
                label: "rs3818361_T",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              }
            ]
          }
        ]
      },
      {
        code: "pet",
        label: "PET - Positron Emission Tomography",
        variables: [
          {
            code: "fdg",
            type: "real",
            label: "FDG-PET",
            description: " Average FDG-PET of angular, temporal, and posterior cingulate. Most important hypometabolic regions that are indicative of pathological metabolic change in MCI and AD.",
            methodology: "adni-merge"
          },
          {
            code: "pib",
            type: "real",
            label: "PIB",
            description: "Average PIB SUVR of frontal cortex, anterior cingulate, precuneus cortex, and parietal cortex. ",
            methodology: "adni-merge"
          },
          {
            code: "av45",
            type: "real",
            label: "AV45",
            description: "AV45 Average AV45 SUVR of frontal, anterior cingulate, precuneus, and parietal cortex\nrelative to the cerebellum",
            methodology: "adni-merge"
          }
        ]
      },
      {
        code: "brain_anatomy",
        label: "Brain Anatomy",
        groups: [
          {
            code: "csf_volume",
            label: "CSF volume",
            variables: [
              {
                code: "rightinflatvent",
                type: "real",
                label: "Right inferior lateral ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "leftinflatvent",
                type: "real",
                label: "Left inferior lateral ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              }
            ]
          },
          {
            code: "grey_matter_volume",
            label: "Grey matter volume",
            groups: [
              {
                code: "cerebellum",
                label: "Cerebellum",
                variables: [
                  {
                    code: "cerebellarvermallobulesviiix",
                    type: "real",
                    label: "Cerebellar Vermal Lobules VIII-X",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "cerebellarvermallobulesvivii",
                    type: "real",
                    label: "Cerebellar Vermal Lobules VI-VII",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "cerebral_nuclei",
                label: "Cerebral nuclei",
                groups: [
                  {
                    code: "basal_ganglia",
                    label: "Basal Ganglia",
                    variables: [
                      {
                        code: "rightbasalforebrain",
                        type: "real",
                        label: "Right Basal Forebrain",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftbasalforebrain",
                        type: "real",
                        label: "Left Basal Forebrain",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      }
                    ]
                  },
                  {
                    code: "amygdala",
                    label: "Amygdala",
                    variables: [
                      {
                        code: "rightamygdala",
                        type: "real",
                        label: "Right Amygdala",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftamygdala",
                        type: "real",
                        label: "Left Amygdala",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      }
                    ]
                  }
                ]
              },
              {
                code: "limbic",
                label: "Limbic",
                variables: [
                  {
                    code: "righthippocampus",
                    type: "real",
                    label: "Right Hippocampus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "lefthippocampus",
                    type: "real",
                    label: "Left Hippocampus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightthalamusproper",
                    type: "real",
                    label: "Right Thalamus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              }
            ]
          }
        ],
        variables: [
          {
            code: "tiv",
            type: "real",
            label: "TIV",
            units: "cm3",
            description: "Total intra-cranial volume",
            methodology: "lren-nmm-volumes"
          },
          {
            code: "brainstem",
            type: "real",
            label: "Brainstem",
            units: "cm3",
            description: "Brainstem volume",
            methodology: "lren-nmm-volumes"
          }
        ]
      }
    ],
    variables: [
      {
        code: "dataset",
        type: "polynominal",
        label: "Dataset",
        description: "Variable used to differentiate datasets.",
        methodology: "mip-cde",
        enumerations: [
          { code: "edsd", label: "EDSD" },
          { code: "adni", label: "ADNI" },
          { code: "ppmi", label: "PPMI" },
          { code: "clm", label: "CLM" }
        ]
      }
    ]
  };

  return mockHierarchy;
}
