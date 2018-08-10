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

export const methods = [
  {
    code: "histograms",
    model: models.regression,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "linearRegression",
    model: models.regression,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "sgdLinearModel",
    model: models.regression,
    modelStatus: "ok",
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
    ],
    validations: [kfold]
  },
  {
    code: "naiveBayes",
    model: models.classification,
    modelStatus: "ok",
    parameters: [
      {
        code: "alpha",
        value: "1"
      },
      {
        code: "class_prior",
        value: ""
      }
    ],
    validations: [kfold]
  },
  {
    code: "sgdNeuralNetwork",
    model: models.classification,
    modelStatus: "ok",
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
    ],
    validations: [kfold]
  },
  {
    code: "gradientBoosting",
    model: models.classification,
    modelStatus: "ok",
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
    ],
    validations: [kfold]
  },
  {
    code: "anova",
    model: models.regression2,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "knn",
    model: models.classification,
    modelStatus: "ok",
    parameters: [
      {
        code: "k",
        value: "5"
      }
    ],
    validations: [kfold]
  },
  {
    code: "correlationHeatmap", // no displayable result, what variables should be used?
    model: models.regression,
    modelStatus: "ko",
    parameters: [],
    validations: []
  },
  {
    code: "pca",
    model: models.regression,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "hedwig", // Job dcb21fac-6766-43af-87c2-b8921c5734ef using hbpmip/python-jsi-hedwig:1.0.7 has completed in Chronos, but encountered timeout while waiting for job results. Does the algorithm store its results or errors in the output database?
    model: models.classification2,
    modelStatus: "ko",
    parameters: [
      {
        code: "beam",
        value: "10"
      },
      {
        code: "support",
        value: "0.1"
      }
    ],
    validations: []
  },
  {
    code: "hinmine",
    model: models.classification,
    modelStatus: "ko",
    parameters: [
      {
        code: "normalize",
        value: "true"
      },
      {
        code: "0.85",
        value: "0.85"
      }
    ],
    validations: []
  },
  {
    code: "tSNE",
    model: models.regression,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "ggparci",
    model: models.classification,
    modelStatus: "ko", // Error in if (min(data_to_plot$value) >= 0 & max(data_to_plot$value) <= : missing value where TRUE/FALSE needed
    parameters: [],
    validations: []
  },
  {
    code: "kmeans",
    model: models.regression,
    modelStatus: "ok",
    parameters: [],
    validations: []
  },
  {
    code: "heatmaply",
    model: models.regression,
    modelStatus: "ko", // Error in hclustfun_col(dist_x): must have n >= 2 objects to cluster
    parameters: [],
    validations: []
  }
  // { code: "WP_VARIABLES_HISTOGRAM" },
  // { code: "PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER" },
  // { code: "PIPELINE_ISOUP_MODEL_TREE_SERIALIZER" },
  // { code: "WP_LINEAR_REGRESSION" },
  // { code: "K_MEANS" }
];
