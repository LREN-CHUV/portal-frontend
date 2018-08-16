export const models = {
  classification: {
    coVariables: [{ code: "lefthippocampus" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets: ["desd-synthdata"],
    validationDatasets: [],
    variables: [{ code: "alzheimerbroadcategory" }]
  },
  classification2: {
    coVariables: [{ code: "apoe4" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets: ["desd-synthdata"],
    validationDatasets: [],
    variables: [{ code: "alzheimerbroadcategory" }]
  },
  regression: {
    coVariables: [{ code: "subjectageyears" }],
    filters: "",
    trainingDatasets: ["desd-synthdata"],
    variables: [{ code: "lefthippocampus" }]
  },
  regression2: {
    coVariables: [{ code: "alzheimerbroadcategory" }],
    filters: "",
    groupings: [],
    testingDatasets: [],
    trainingDatasets: ["desd-synthdata"],
    validationDatasets: [],
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
    model: models.regression,
    status: "ok",
    name: "histograms",
    methods: [
      {
        code: "histograms",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.regression,
    status: "ok",
    name: "linearRegression",
    methods: [
      {
        code: "linearRegression",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.regression,
    status: "ok",
    name: "sgdLinearModel",
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
    validations: [kfold]
  },
  {
    model: models.classification,
    status: "ok",
    name: "naiveBayes",
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
    validations: [kfold]
  },
  {
    model: models.classification,
    status: "ok",
    name: "sgdNeuralNetwork",
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
    validations: [kfold]
  },
  {
    model: models.classification,
    status: "ok",
    name: "gradientBoosting",
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
    validations: [kfold]
  },
  {
    model: models.regression2,
    status: "ok",
    name: "anova",
    methods: [
      {
        code: "anova",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.classification,
    status: "ok",
    name: "knn",
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
    validations: [kfold]
  },
  {
    model: models.regression,
    status: "ko",
    name: "correlationHeatmap",
    methods: [
      {
        code: "correlationHeatmap", // no displayable result, what variables should be used?
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.regression,
    status: "ok",
    name: "pca",
    methods: [
      {
        code: "pca",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.classification2,
    status: "ko",
    name: "hedwig",
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
    validations: []
  },
  {
    model: models.classification,
    status: "ko",
    name: "hinmine",
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
    validations: []
  },
  {
    model: models.regression,
    status: "ok",
    name: "tSNE-linearRegression",
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
    validations: []
  },
  {
    model: models.classification,
    status: "ko", // Error in if (min(data_to_plot$value) >= 0 & max(data_to_plot$value) <= : missing value where TRUE/FALSE needed
    name: "ggparci",
    methods: [
      {
        code: "ggparci",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.regression,
    status: "ok",
    name: "kmeans",
    methods: [
      {
        code: "kmeans",
        parameters: []
      }
    ],
    validations: []
  },
  {
    model: models.regression,
    status: "ko", // Error in hclustfun_col(dist_x): must have n >= 2 objects to cluster
    name: "heatmaply",
    methods: [
      {
        code: "heatmaply",
        parameters: []
      }
    ],
    validations: []
  }
  // { code: "WP_VARIABLES_HISTOGRAM" },
  // { code: "PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER" },
  // { code: "PIPELINE_ISOUP_MODEL_TREE_SERIALIZER" },
  // { code: "WP_LINEAR_REGRESSION" },
  // { code: "K_MEANS" }
];
