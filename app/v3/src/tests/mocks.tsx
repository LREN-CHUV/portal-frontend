import * as dotenv from "dotenv";

dotenv.config();

const trainingDatasetsValue = process.env.REACT_APP_TRAININGDATASETS;
const trainingDatasets: string[] = trainingDatasetsValue
  ? trainingDatasetsValue.split(",")
  : [];
const validationDatasetsValue = process.env.REACT_APP_VALIDATIONDATASETS;
const validationDatasets: string[] = validationDatasetsValue
  ? validationDatasetsValue.split(",")
  : [];
  const Cookie = process.env.REACT_APP_COOKIE

export const config: RequestInit =
  process.env.NODE_ENV === "production"
    ? {
        credentials: "same-origin"
      }
    : Cookie ? {
        headers: {
          Authorization: process.env.REACT_APP_AUTHORIZATION!,
          Cookie,
          "X-XSRF-TOKEN":
          Cookie.match(/XSRF-TOKEN=(.*)/)![1] || ""
        }
      } : {};

export const models = {
  classification: {
    coVariables: [{ code: "lefthippocampus" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets,
    validationDatasets,
    variables: [{ code: "alzheimerbroadcategory" }]
  },
  classification2: {
    coVariables: [{ code: "apoe4" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets,
    validationDatasets,
    variables: [{ code: "alzheimerbroadcategory" }]
  },
  regression0: {
    coVariables: [{ code: "subjectageyears" }],
    filters: "",
    groupings: [],
    trainingDatasets,
    validationDatasets,
    variables: [{ code: "lefthippocampus" }]
  },
  regression2: {
    coVariables: [{ code: "alzheimerbroadcategory" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets,
    validationDatasets,
    variables: [{ code: "lefthippocampus" }]
  }
};

const kfold = {
  code: "kfold",
  name: "validation",
  parameters: [
    {
      code: "k",
      value: "2"
    }
  ]
};

export const experiments = [
  {
    model: models.regression0,
    name: "histograms",
    status: "ok",

    methods: [
      {
        code: "histograms",
        parameters: []
      }
    ],
    validations: []
  },
  {
    methods: [
      {
        code: "linearRegression",
        parameters: []
      }
    ],
    model: models.regression0,
    name: "linearRegression",
    status: "ok",
    validations: []
  },
  {
    methods: [
      {
        code: "sgdLinearModel",

        parameters: [
          {
            code: "alpha",
            value: "0.0001"
          },
          {
            code: "penalty",
            value: "l2"
          },
          {
            code: "l1_ratio",
            value: "0.15"
          }
        ]
      }
    ],
    model: models.regression0,
    name: "sgdLinearModel",
    status: "ok",
    validations: [kfold]
  },
  {
    methods: [
      {
        code: "naiveBayes",

        parameters: [
          {
            code: "alpha",
            value: "1"
          },
          {
            code: "class_prior",
            value: ""
          }
        ]
      }
    ],
    model: models.classification,
    name: "naiveBayes",
    status: "ok",
    validations: [kfold]
  },
  {
    methods: [
      {
        code: "sgdNeuralNetwork",

        parameters: [
          {
            code: "hidden_layer_sizes",
            value: "100"
          },
          {
            code: "activation",
            value: "relu"
          },
          {
            code: "alpha",
            value: "0.0001"
          },
          {
            code: "learning_rate_init",
            value: "0.001"
          }
        ]
      }
    ],
    model: models.classification,
    name: "sgdNeuralNetwork",
    status: "ok",
    validations: [kfold]
  },
  {
    methods: [
      {
        code: "gradientBoosting",

        parameters: [
          {
            code: "learning_rate",
            value: "0.1"
          },
          {
            code: "n_estimators",
            value: "100"
          },
          {
            code: "max_depth",
            value: "3"
          },
          {
            code: "min_samples_split",
            value: "2"
          },
          {
            code: "min_samples_leaf",
            value: "1"
          },
          {
            code: "min_weight_fraction_leaf",
            value: "0"
          },
          {
            code: "min_impurity_decrease",
            value: "0"
          }
        ]
      }
    ],
    model: models.classification,
    name: "gradientBoosting",
    status: "ok",
    validations: [kfold]
  },
  {
    methods: [
      {
        code: "anova",
        parameters: []
      }
    ],
    model: models.regression2,
    name: "anova",
    status: "ok",
    validations: []
  },
  {
    methods: [
      {
        code: "knn",
        parameters: [
          {
            code: "k",
            value: "5"
          }
        ]
      }
    ],
    model: models.classification,
    name: "knn",
    status: "ok",
    validations: [kfold]
  },
  {
    methods: [
      {
        code: "correlationHeatmap", // no displayable result, what variables should be used?
        parameters: []
      }
    ],
    model: models.regression0,
    name: "correlationHeatmap",
    status: "ko",
    validations: []
  },
  {
    methods: [
      {
        code: "pca",
        parameters: []
      }
    ],
    model: models.regression0,
    name: "pca",
    status: "ok",

    validations: []
  },
  {
    methods: [
      {
        code: "hedwig", // Job dcb21fac-6766-43af-87c2-b8921c5734ef using hbpmip/python-jsi-hedwig:1.0.7 has completed in Chronos, but encountered timeout while waiting for job results. Does the algorithm store its results or errors in the output database?
        parameters: [
          {
            code: "beam",
            value: "10"
          },
          {
            code: "support",
            value: "0.1"
          }
        ]
      }
    ],
    model: models.classification2,
    name: "hedwig",
    status: "ko",
    validations: []
  },
  {
    methods: [
      {
        code: "hinmine",
        parameters: [
          {
            code: "normalize",
            value: "true"
          },
          {
            code: "0.85",
            value: "0.85"
          }
        ]
      }
    ],
    model: models.classification,
    name: "hinmine",
    status: "ko",
    validations: []
  },
  {
    methods: [
      {
        code: "tSNE",
        parameters: []
      },
      {
        code: "linearRegression",
        parameters: []
      }
    ],
    model: models.regression0,
    name: "tSNE-linearRegression",
    status: "ok",
    validations: []
  },
  {
    methods: [
      {
        code: "ggparci",
        parameters: []
      }
    ],
    model: models.classification,
    name: "ggparci",
    status: "ko", // Error in if (min(data_to_plot$value) >= 0 & max(data_to_plot$value) <= : missing value where TRUE/FALSE needed
    validations: []
  },
  {
    methods: [
      {
        code: "kmeans",
        parameters: []
      }
    ],
    model: models.regression0,
    name: "kmeans",
    status: "ok",
    validations: []
  },
  {
    methods: [
      {
        code: "heatmaply",
        parameters: []
      }
    ],
    model: models.regression0,
    name: "heatmaply",
    status: "ko", // Error in hclustfun_col(dist_x): must have n >= 2 objects to cluster
    validations: []
  }


  // { code: "WP_VARIABLES_HISTOGRAM" },
  // { code: "PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER" },
  // { code: "PIPELINE_ISOUP_MODEL_TREE_SERIALIZER" },
  // { code: "WP_LINEAR_REGRESSION" },
  // { code: "K_MEANS" }
];
