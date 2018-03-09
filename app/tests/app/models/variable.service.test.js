"use strict";

describe("Service: variable.service", function() {
  beforeEach(module("app.config"));
  beforeEach(module("chuvApp.components.criteria"));

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
              },
              {
                code: "rs744373_c",
                type: "polynominal",
                label: "rs744373_C",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs190982_g",
                type: "polynominal",
                label: "rs190982_G",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs1476679_c",
                type: "polynominal",
                label: "rs1476679_C",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs11767557_c",
                type: "polynominal",
                label: "rs11767557_C",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs11136000_t",
                type: "polynominal",
                label: "rs11136000_T",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs610932_a",
                type: "polynominal",
                label: "rs610932_A",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs3851179_a",
                type: "polynominal",
                label: "rs3851179_A",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs17125944_c",
                type: "polynominal",
                label: "rs17125944_C",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs10498633_t",
                type: "polynominal",
                label: "rs10498633_T",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs3764650_g",
                type: "polynominal",
                label: "rs3764650_G",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs3865444_t",
                type: "polynominal",
                label: "rs3865444_T",
                sql_type: "int",
                description: "",
                methodology: "lren-nmm-volumes",
                enumerations: [
                  { code: 0, label: 0 },
                  { code: 1, label: 1 },
                  { code: 2, label: 2 }
                ]
              },
              {
                code: "rs2718058_g",
                type: "polynominal",
                label: "rs2718058_G",
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
              },
              {
                code: "rightlateralventricle",
                type: "real",
                label: "Right lateral ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "leftlateralventricle",
                type: "real",
                label: "Left lateral ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "_3rdventricle",
                type: "real",
                label: "3rd Ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "_4thventricle",
                type: "real",
                label: "4th Ventricle",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "csfglobal",
                type: "real",
                label: "CSF global",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              }
            ]
          },
          {
            code: "white_matter_volume",
            label: "White matter volume",
            variables: [
              {
                code: "rightcerebellumwhitematter",
                type: "real",
                label: "Right Cerebellum White Matter",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "leftcerebellumwhitematter",
                type: "real",
                label: "Left Cerebellum White Matter",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "rightcerebralwhitematter",
                type: "real",
                label: "Right Cerebral White Matter",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "leftcerebralwhitematter",
                type: "real",
                label: "Left Cerebral White Matter",
                units: "cm3",
                description: "",
                methodology: "lren-nmm-volumes"
              },
              {
                code: "opticchiasm",
                type: "real",
                label: "Optic chiasm",
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
                  },
                  {
                    code: "cerebellarvermallobulesiv",
                    type: "real",
                    label: "Cerebellar Vermal Lobules I-V",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftcerebellumexterior",
                    type: "real",
                    label: "Left Cerebellum Exterior",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightcerebellumexterior",
                    type: "real",
                    label: "Right Cerebellum Exterior",
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
                      },
                      {
                        code: "rightaccumbensarea",
                        type: "real",
                        label: "Right Accumbens Area",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftaccumbensarea",
                        type: "real",
                        label: "Left Accumbens Area",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "rightcaudate",
                        type: "real",
                        label: "Right Caudate",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftcaudate",
                        type: "real",
                        label: "Left Caudate",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "rightpallidum",
                        type: "real",
                        label: "Right Pallidum",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftpallidum",
                        type: "real",
                        label: "Left Pallidum",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "rightputamen",
                        type: "real",
                        label: "Right Putamen",
                        units: "cm3",
                        description: "",
                        methodology: "lren-nmm-volumes"
                      },
                      {
                        code: "leftputamen",
                        type: "real",
                        label: "Left Putamen",
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
                  },
                  {
                    code: "leftthalamusproper",
                    type: "real",
                    label: "Left Thalamus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightacgganteriorcingulategyrus",
                    type: "real",
                    label: "Right anterior cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftacgganteriorcingulategyrus",
                    type: "real",
                    label: "Left anterior cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightententorhinalarea",
                    type: "real",
                    label: "Right entorhinal area",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftententorhinalarea",
                    type: "real",
                    label: "Left entorhinal area",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmcggmiddlecingulategyrus",
                    type: "real",
                    label: "Right middle cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmcggmiddlecingulategyrus",
                    type: "real",
                    label: "Left middle cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightpcggposteriorcingulategyrus",
                    type: "real",
                    label: "Right posterior cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftpcggposteriorcingulategyrus",
                    type: "real",
                    label: "Left posterior cingulate gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightphgparahippocampalgyrus",
                    type: "real",
                    label: "Right parahippocampal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftphgparahippocampalgyrus",
                    type: "real",
                    label: "Left parahippocampal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "temporal",
                label: "Temporal",
                variables: [
                  {
                    code: "rightfugfusiformgyrus",
                    type: "real",
                    label: "Right fusiform gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftfugfusiformgyrus",
                    type: "real",
                    label: "Left fusiform gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightitginferiortemporalgyrus",
                    type: "real",
                    label: "Right inferior temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftitginferiortemporalgyrus",
                    type: "real",
                    label: "Left inferior temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmtgmiddletemporalgyrus",
                    type: "real",
                    label: "Right middle temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmtgmiddletemporalgyrus",
                    type: "real",
                    label: "Left middle temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightppplanumpolare",
                    type: "real",
                    label: "Right planum polare",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftppplanumpolare",
                    type: "real",
                    label: "Left planum polare",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightptplanumtemporale",
                    type: "real",
                    label: "Right planum temporale",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftptplanumtemporale",
                    type: "real",
                    label: "Left planum temporale",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightstgsuperiortemporalgyrus",
                    type: "real",
                    label: "Right superior temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftstgsuperiortemporalgyrus",
                    type: "real",
                    label: "Left superior temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "righttmptemporalpole",
                    type: "real",
                    label: "Right temporal pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "lefttmptemporalpole",
                    type: "real",
                    label: "Left temporal pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightttgtransversetemporalgyrus",
                    type: "real",
                    label: "Right transverse temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftttgtransversetemporalgyrus",
                    type: "real",
                    label: "Left transverse temporal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "occipital",
                label: "Occipital",
                variables: [
                  {
                    code: "rightcalccalcarinecortex",
                    type: "real",
                    label: "Right calcarine cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftcalccalcarinecortex",
                    type: "real",
                    label: "Left calcarine cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightcuncuneus",
                    type: "real",
                    label: "Right cuneus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftcuncuneus",
                    type: "real",
                    label: "Left cuneus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightioginferioroccipitalgyrus",
                    type: "real",
                    label: "Right inferior occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftioginferioroccipitalgyrus",
                    type: "real",
                    label: "Left inferior occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightliglingualgyrus",
                    type: "real",
                    label: "Right lingual gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftliglingualgyrus",
                    type: "real",
                    label: "Left lingual gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmogmiddleoccipitalgyrus",
                    type: "real",
                    label: "Right middle occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmogmiddleoccipitalgyrus",
                    type: "real",
                    label: "Left middle occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightocpoccipitalpole",
                    type: "real",
                    label: "Right occipital pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftocpoccipitalpole",
                    type: "real",
                    label: "Left occipital pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightofugoccipitalfusiformgyrus",
                    type: "real",
                    label: "Right occipital fusiform gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftofugoccipitalfusiformgyrus",
                    type: "real",
                    label: "Left occipital fusiform gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightsogsuperioroccipitalgyrus",
                    type: "real",
                    label: "Right superior occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftsogsuperioroccipitalgyrus",
                    type: "real",
                    label: "Left superior occipital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "parietal",
                label: "Parietal",
                variables: [
                  {
                    code: "rightangangulargyrus",
                    type: "real",
                    label: "Right angular gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftangangulargyrus",
                    type: "real",
                    label: "Left angular gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmpogpostcentralgyrusmedialsegment",
                    type: "real",
                    label: "Right postcentral gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmpogpostcentralgyrusmedialsegment",
                    type: "real",
                    label: "Left postcentral gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightpcuprecuneus",
                    type: "real",
                    label: "Right precuneus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftpcuprecuneus",
                    type: "real",
                    label: "Left precuneus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightpogpostcentralgyrus",
                    type: "real",
                    label: "Right postcentral gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftpogpostcentralgyrus",
                    type: "real",
                    label: "Left postcentral gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightsmgsupramarginalgyrus",
                    type: "real",
                    label: "Right supramarginal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftsmgsupramarginalgyrus",
                    type: "real",
                    label: "Left supramarginal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightsplsuperiorparietallobule",
                    type: "real",
                    label: "Right superior parietal lobule",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftsplsuperiorparietallobule",
                    type: "real",
                    label: "Left superior parietal lobule",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "frontal",
                label: "Frontal",
                variables: [
                  {
                    code: "rightaorganteriororbitalgyrus",
                    type: "real",
                    label: "Right anterior orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftaorganteriororbitalgyrus",
                    type: "real",
                    label: "Left anterior orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightcocentraloperculum",
                    type: "real",
                    label: "Right central operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftcocentraloperculum",
                    type: "real",
                    label: "Left central operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightfofrontaloperculum",
                    type: "real",
                    label: "Right frontal operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftfofrontaloperculum",
                    type: "real",
                    label: "Left frontal operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightfrpfrontalpole",
                    type: "real",
                    label: "Right frontal pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftfrpfrontalpole",
                    type: "real",
                    label: "Left frontal pole",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightgregyrusrectus",
                    type: "real",
                    label: "Right gyrus rectus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftgregyrusrectus",
                    type: "real",
                    label: "Left gyrus rectus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightlorglateralorbitalgyrus",
                    type: "real",
                    label: "Right lateral orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftlorglateralorbitalgyrus",
                    type: "real",
                    label: "Left lateral orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmfcmedialfrontalcortex",
                    type: "real",
                    label: "Right medial frontal cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmfcmedialfrontalcortex",
                    type: "real",
                    label: "Left medial frontal cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmfgmiddlefrontalgyrus",
                    type: "real",
                    label: "Right middle frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmfgmiddlefrontalgyrus",
                    type: "real",
                    label: "Left middle frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmorgmedialorbitalgyrus",
                    type: "real",
                    label: "Right medial orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmorgmedialorbitalgyrus",
                    type: "real",
                    label: "Left medial orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmprgprecentralgyrusmedialsegment",
                    type: "real",
                    label: "Right precentral gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmprgprecentralgyrusmedialsegment",
                    type: "real",
                    label: "Left precentral gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightmsfgsuperiorfrontalgyrusmedialsegment",
                    type: "real",
                    label: "Right superior frontal gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftmsfgsuperiorfrontalgyrusmedialsegment",
                    type: "real",
                    label: "Left superior frontal gyrus medial segment",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightopifgopercularpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Right opercular part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftopifgopercularpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Left opercular part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightorifgorbitalpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Right orbital part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftorifgorbitalpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Left orbital part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightpoparietaloperculum",
                    type: "real",
                    label: "Right parietal operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftpoparietaloperculum",
                    type: "real",
                    label: "Left parietal operculum",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightporgposteriororbitalgyrus",
                    type: "real",
                    label: "Right posterior orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftporgposteriororbitalgyrus",
                    type: "real",
                    label: "Left posterior orbital gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightprgprecentralgyrus",
                    type: "real",
                    label: "Right precentral gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftprgprecentralgyrus",
                    type: "real",
                    label: "Left precentral gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightscasubcallosalarea",
                    type: "real",
                    label: "Right subcallosal area",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftscasubcallosalarea",
                    type: "real",
                    label: "Left subcallosal area",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightsfgsuperiorfrontalgyrus",
                    type: "real",
                    label: "Right superior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftsfgsuperiorfrontalgyrus",
                    type: "real",
                    label: "Left superior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightsmcsupplementarymotorcortex",
                    type: "real",
                    label: "Right supplementary motor cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftsmcsupplementarymotorcortex",
                    type: "real",
                    label: "Left supplementary motor cortex",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "righttrifgtriangularpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Right triangular part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "lefttrifgtriangularpartoftheinferiorfrontalgyrus",
                    type: "real",
                    label: "Left triangular part of the inferior frontal gyrus",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "insula",
                label: "Insula",
                variables: [
                  {
                    code: "rightainsanteriorinsula",
                    type: "real",
                    label: "Right anterior insula",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftainsanteriorinsula",
                    type: "real",
                    label: "Left anterior insula",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "rightpinsposteriorinsula",
                    type: "real",
                    label: "Right posterior insula",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftpinsposteriorinsula",
                    type: "real",
                    label: "Left posterior insula",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  }
                ]
              },
              {
                code: "diencephalon",
                label: "Diencephalon",
                variables: [
                  {
                    code: "rightventraldc",
                    type: "real",
                    label: "Right Ventral DC",
                    units: "cm3",
                    description: "",
                    methodology: "lren-nmm-volumes"
                  },
                  {
                    code: "leftventraldc",
                    type: "real",
                    label: "Left Ventral DC",
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
      },
      {
        code: "demographics",
        label: "Demographics",
        variables: [
          {
            code: "subjectageyears",
            type: "integer",
            label: "Age Years",
            units: "years",
            length: 3,
            maxValue: 130,
            minValue: 0,
            description: "Subject age in years.",
            methodology: "mip-cde"
          },
          {
            code: "subjectage",
            type: "real",
            label: "Exact age",
            units: "months",
            length: 2,
            maxValue: 11,
            minValue: 0,
            description: "Exact age of the subject, for datasets that allow such precision.",
            methodology: "mip-cde"
          },
          {
            code: "agegroup",
            type: "polynominal",
            label: "Age Group",
            description: "Age Group",
            methodology: "mip-cde",
            enumerations: [
              { code: "-50y", label: "-50y" },
              { code: "50-59y", label: "50-59y" },
              { code: "60-69y", label: "60-69y" },
              { code: "70-79y", label: "70-79y" },
              { code: "+80y", label: "+80y" }
            ]
          },
          {
            code: "gender",
            type: "binominal",
            label: "Gender",
            length: 1,
            description: "Gender of the patient - Sex assigned at birth",
            methodology: "mip-cde",
            enumerations: [
              { code: "M", label: "Male" },
              { code: "F", label: "Female" }
            ]
          },
          {
            code: "handedness",
            type: "polynominal",
            label: "Handedness",
            length: 1,
            description: "Describes the tendency of the patient to use either the right or the left hand more naturally than the other.",
            methodology: "mip-cde",
            enumerations: [
              { code: "R", label: "Right" },
              { code: "L", label: "Left" },
              { code: "A", label: "Ambidextrous" }
            ]
          }
        ]
      },
      {
        code: "neuropsychology",
        label: "Neuropsychology",
        groups: [
          {
            code: "updrs",
            label: "UPDRS",
            variables: [
              {
                code: "updrstotal",
                type: "integer",
                label: "UPDRS - Unified Parkinson Disease Rating Scale",
                maxValue: 172,
                minValue: 0,
                description: "The unified Parkinson's disease rating scale (UPDRS) is used to follow the longitudinal course of Parkinson's disease. The UPD rating scale is the most commonly used scale in the clinical study of Parkinson's disease.",
                methodology: "mip-cde"
              },
              {
                code: "updrshy",
                type: "integer",
                label: "UPDRS HY - Hoehn and Yahr scale",
                maxValue: 5,
                minValue: 0,
                description: "The Hoehn and Yahr scale (HY) is a widely used clinical rating scale, which defines broad categories of motor function in Parkinson’s disease (PD). It captures typical patterns of progressive motor impairment.",
                methodology: "mip-cde"
              }
            ]
          },
          {
            code: "clm_scores",
            label: "CLM scores",
            variables: [
              {
                code: "iqcode",
                type: "real",
                label: "iqcode",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "bnt_cd",
                type: "integer",
                label: "bnt_cd",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "fardeau_zarit",
                type: "integer",
                label: "fardeau_zarit",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "iadl_aivq",
                type: "integer",
                label: "iadl_aivq",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "haddepression",
                type: "integer",
                label: "haddepression",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "bnt_ab",
                type: "integer",
                label: "bnt_ab",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "basic_activities_of_daily_living_badl",
                type: "integer",
                label: "basic_activities_of_daily_living_badl",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "hadanxiete",
                type: "integer",
                label: "hadanxiete",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "disability_assessment_of_dementia_dad6",
                type: "integer",
                label: "disability_assessment_of_dementia_dad6",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "qpc",
                type: "integer",
                label: "qpc",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "npiq__severite",
                type: "integer",
                label: "npiq__severite",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "npiq__detresse",
                type: "integer",
                label: "npiq__detresse",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "cerad",
                type: "integer",
                label: "cerad",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "gs",
                type: "integer",
                label: "gs",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "pim",
                type: "integer",
                label: "pim",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "gss",
                type: "integer",
                label: "gss",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "bard",
                type: "integer",
                label: "bard",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "ticsf_oral_mots",
                type: "integer",
                label: "ticsf_oral_mots",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "ticsf_oral_phrases",
                type: "integer",
                label: "ticsf_oral_phrases",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "ticsf_ecrit_phrases",
                type: "integer",
                label: "ticsf_ecrit_phrases",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "figures_enchevetrees_ben",
                type: "integer",
                label: "figures_enchevetrees_ben",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "ticsf_ecrit_mots",
                type: "integer",
                label: "ticsf_ecrit_mots",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "set_test_disaacs",
                type: "integer",
                label: "set_test_disaacs",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "minizarit",
                type: "integer",
                label: "minizarit",
                description: "",
                methodology: "clm-extra"
              }
            ]
          }
        ],
        variables: [
          {
            code: "minimentalstate",
            type: "integer",
            label: "MMSE - Mini Mental State Examination",
            maxValue: 30,
            minValue: 0,
            description: "The Mini–Mental State Examination (MMSE) or Folstein test is a 30-point questionnaire that is used extensively in clinical and research settings to measure cognitive impairment. It is commonly used to screen for dementia.",
            methodology: "mip-cde"
          },
          {
            code: "montrealcognitiveassessment",
            type: "integer",
            label: "MoCA - Montreal Cognitive Assessment",
            maxValue: 30,
            minValue: 0,
            description: "The Montreal Cognitive Assessment (MoCA) was designed as a rapid screening instrument for mild cognitive dysfunction. It assesses different cognitive domains: attention and concentration, executive functions, memory, language, visuoconstructional skills, conceptual thinking, calculations, and orientation. MoCA Total Scores refer to the final count obtained by patients after the complete test is performed.",
            methodology: "mip-cde"
          }
        ]
      },
      {
        code: "diagnosis",
        label: "Diagnosis",
        groups: [
          {
            code: "dataset_specific_diagnosis",
            label: "Dataset Specific Diagnosis",
            variables: [
              {
                code: "adnicategory",
                type: "polynominal",
                label: "ADNI category",
                description: "Terms aggregating illnesses into classes. Note that the diagnosis in this categories are given only for the ADNI data set.",
                methodology: "mip-cde",
                enumerations: [
                  { code: "AD", label: "Alzheimer's Disease" },
                  { code: "MCI", label: "Mild Cognitive Impairment" },
                  { code: "CN", label: "Cognitively Normal" }
                ]
              },
              {
                code: "edsdcategory",
                type: "polynominal",
                label: "EDSD category",
                description: "Terms aggregating illnesses into classes. Note that the diagnosis in this categories are given only for the EDSD data set.",
                methodology: "mip-cde",
                enumerations: [
                  { code: "AD", label: "Alzheimer's Disease" },
                  { code: "MCI", label: "Mild Cognitive Impairment" },
                  { code: "CN", label: "Cognitively Normal" }
                ]
              },
              {
                code: "ppmicategory",
                type: "polynominal",
                label: "PPMI category",
                description: "Terms aggregating the Parkinson's diseases into classes. For this instance the diagnosis given at enrollment is taken as the clinical diagnosis. Note that the diagnosis in this categories are given only for the PPMI data set.",
                methodology: "mip-cde",
                enumerations: [
                  { code: "PD", label: "Parkinson disease" },
                  { code: "HC", label: "Healthy controls" },
                  { code: "PRODROMA", label: "Prodromal" },
                  {
                    code: "GENPD",
                    label: "Genetic PD patients with a mutation (LRRK2, GBA or SNCA)"
                  },
                  {
                    code: "REGUN",
                    label: "Genetic Unaffected patients with a mutation (LRRK2, GBA or SNCA)"
                  },
                  {
                    code: "REGPD",
                    label: "Genetic registry PD subjects with a mutation (LRRK2, GBA, or SNCA)"
                  },
                  {
                    code: "REGUN",
                    label: "Genetic registry unaffected subjects with a mutation (LRRK2, GBA, or SNCA)"
                  }
                ]
              },
              {
                code: "clmcategory",
                type: "polynominal",
                label: "CLM Category",
                description: "Terms aggregating illnesses into classes. Note that the diagnosis in this categories are given only for the CLM data set.",
                methodology: "clm-extra",
                enumerations: [
                  {
                    code: "AD atypical or mixed type",
                    label: "Alzheimer's disease, atypical or mixed type"
                  },
                  { code: "AD", label: "Alzheimer's disease" },
                  {
                    code: "Transient global amnesia",
                    label: "Transient global amnesia"
                  },
                  { code: "Dementia - other", label: "Dementia - other" },
                  {
                    code: "Frontotemporal dementia",
                    label: "Frontotemporal dementia"
                  },
                  { code: "HIV", label: "HIV" },
                  { code: "MCI", label: "MCI" },
                  { code: "PD", label: "Parkinson's disease" },
                  {
                    code: "Subjective cognitive complaints",
                    label: "Subjective cognitive complaints"
                  },
                  {
                    code: "Subjective cognitive complaints with multiple etiology",
                    label: "Subjective cognitive complaints with multiple etiology"
                  },
                  {
                    code: "Cognitive impairments - other",
                    label: "Cognitive impairments - other"
                  },
                  {
                    code: "Cognitive impairments with mixed etiology",
                    label: "Cognitive impairments with mixed etiology"
                  },
                  {
                    code: "Cognitive impairments with psychiatric etiology",
                    label: "Cognitive impairments with psychiatric etiology"
                  },
                  { code: "Vascular", label: "Vascular" }
                ]
              }
            ]
          }
        ],
        variables: [
          {
            code: "alzheimerbroadcategory",
            type: "polynominal",
            label: "Alzheimer Broad Category",
            description: "There will be two broad categories taken into account. Alzheimer's disease (AD) in which the diagnostic is 100% certain and \"Other\" comprising the rest of Alzheimer's related categories. The \"Other\" category refers to Alzheime's related diagnosis which origin can be traced to other pathology eg. vascular. In this category MCI diagnosis can also be found. In summary, all Alzheimer's related diagnosis that are not pure.",
            methodology: "mip-cde",
            enumerations: [
              { code: "AD", label: "Alzheimer's disease" },
              { code: "CN", label: "Cognitively Normal" },
              { code: "Other", label: "Other" }
            ]
          },
          {
            code: "parkinsonbroadcategory",
            type: "polynominal",
            label: "Parkinson Broad Category",
            description: "There will be two broad categories taken into account. Parkinson's disease without disability or light disability: Without fluctuation of the effect. Dementia in Parkinson's disease",
            methodology: "mip-cde",
            enumerations: [
              { code: "PD", label: "Dementia in Parkinson's disease" },
              { code: "CN", label: "Healthy control" },
              {
                code: "Other",
                label: "Parkinson's disease without disability or light disability: Without fluctuation of the effect"
              }
            ]
          },
          {
            code: "neurodegenerativescategories",
            type: "polynominal",
            label: "Neurodegeneratives categories",
            description: "There will be two broad categories taken into account. Parkinson's disease without disability or light disability: Without fluctuation of the effect. Dementia in Parkinson's disease",
            methodology: "mip-cde",
            enumerations: [
              { code: "PD", label: "Parkinson's disease" },
              { code: "AD", label: "Alzheimer's disease" },
              { code: "HD", label: "Huntington's disease" },
              { code: "ALS", label: "Amyotrophic lateral sclerosis" },
              { code: "BD", label: "Batten disease" },
              { code: "MCI", label: "MCI" },
              { code: "LBD", label: "Lewy body dementia" },
              { code: "CJD", label: "Maladie de Creutzfeldt-Jakob" }
            ]
          }
        ]
      },
      {
        code: "csf_biology",
        label: "CSF Biology",
        groups: [
          {
            code: "adbiomarker",
            label: "AD Biomarker",
            variables: [
              {
                code: "htauaglcr",
                type: "real",
                label: "Total Tau (h-tau)",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "phosphotaulcr",
                type: "real",
                label: "Phosphorylated Tau (p-tau)",
                description: "",
                methodology: "clm-extra"
              },
              {
                code: "bamyloidlcr",
                type: "real",
                label: "Beta-Amyloid",
                description: "",
                methodology: "clm-extra"
              }
            ]
          }
        ],
        variables: [
          {
            code: "proteinestotglcr",
            type: "real",
            label: "Total proteines g",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "albuminelcr",
            type: "integer",
            label: "Albumine",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "lactatelcr",
            type: "real",
            label: "Lactate",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "borriggelfalcr",
            type: "real",
            label: "IgG ELFA Borreliosis",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "proteinestotmglcr",
            type: "integer",
            label: "Total Proteines mg",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "glucoselcr",
            type: "real",
            label: "Glucose",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "erythrocyteslcr",
            type: "integer",
            label: "Erythrocytes",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "nbreleucocyteslcr",
            type: "integer",
            label: "Nb of Leucocytes",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "neutrophileslcr",
            type: "integer",
            label: "Neutrophil",
            description: "",
            methodology: "clm-extra"
          },
          {
            code: "borrsynth",
            type: "real",
            label: "borrsynth",
            description: "",
            methodology: "clm-extra"
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

  var Variable, $httpBackend;

  beforeEach(
    inject(function(
      $resource,
      backendUrl,
      $http,
      $cacheFactory,
      $q,
      _Variable_,
      _$httpBackend_
    ) {
      Variable = _Variable_;
      $httpBackend = _$httpBackend_;
    })
  );

  it("Should return the variable name", function(done) {
    $httpBackend.when("GET", "/variables/hierarchy").respond(mockHierarchy);
    Variable.getVariableData(mockHierarchy, "righthippocampus").then(function(
      data
    ) {
      console.log(data);
      expect(data.name).toEqual("Right Hippocampus");
      done();
    });
  });
});
