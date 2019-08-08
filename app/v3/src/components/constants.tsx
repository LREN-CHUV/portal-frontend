export const excludedMethods = [
  //  'HISTOGRAMS',
  'LIST_DATASET',
  'LIST_VARIABLES',
  'PIPELINE_ISOUP_MODEL_TREE_SERIALIZER',
  'PIPELINE_ISOUP_REGRESSION_TREE_SERIALIZER',
  'histograms',
  'statisticsSummary',
  'hinmine',
  'hedwig',
  'ggparci',
  'kmeans',
  'heatmaply'
];

// Mime types
export enum MIME_TYPES {
  ERROR = 'text/plain+error',
  HIGHCHARTS = 'application/vnd.highcharts+json',
  JSON = 'application/json',
  MIP_PFA = 'application/vnd.hbp.mip.experiment.pfa+json',
  MIP_COMPOUND = 'application/vnd.hbp.mip.compound+json',
  PFA = 'application/pfa+json',
  PLOTLY = 'application/vnd.plotly.v1+json',
  VISJS = 'application/vnd.visjs+javascript',
  JSONDATA = 'application/vnd.dataresource+json',
  HTML = 'text/html',
  TEXT = 'text/plain',
  JSONRAW = 'application/raw+json'
}

export const algorithmDefaultOutputConfig = [
  {
    name: 'ANOVA',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    name: 'LINEAR_REGRESSION',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    name: 'LOGISTIC_REGRESSION',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  }
];

interface ILabel {
  code: string;
  label: string;
}

interface ISCORES {
  accuracy: ILabel;
  confusionMatrix: ILabel;
  explainedVariance: ILabel;
  f1score: ILabel;
  falsePositiveRate: ILabel;
  mae: ILabel;
  mse: ILabel;
  precision: ILabel;
  recall: ILabel;
  rmse: ILabel;
  rsquared: ILabel;
  type: ILabel;
  [key: string]: any;
}

// regression && classification scores labels
const accuracy: ILabel = { code: 'Accuracy', label: 'Accuracy' };
const f1score: ILabel = {
  code: 'Weighted F1-score',
  label: 'Weighted F1-score'
};
const falsePositiveRate: ILabel = {
  code: 'Weighted false positive rate',
  label: 'Weighted false positive rate'
};
const precision: ILabel = {
  code: 'Weighted precision',
  label: 'Weighted precision'
};
const recall: ILabel = { code: 'Weighted recall', label: 'Weighted recall' };
const confusionMatrix: ILabel = {
  code: 'Confusion matrix',
  label: 'Confusion matrix'
};

const explainedVariance: ILabel = {
  code: 'Explained variance',
  label: 'Explained variance'
};
const mae: ILabel = { code: 'MAE', label: 'Mean absolute error' };
const mse: ILabel = { code: 'MSE', label: 'Mean square error' };
const rsquared: ILabel = {
  code: 'R-squared',
  label: 'Coefficient of determination (R²)'
};
const rmse: ILabel = { code: 'RMSE', label: 'Root mean square error' };
const type: ILabel = { code: 'type', label: 'Explained variance' };

export const SCORES: ISCORES = {
  accuracy,
  confusionMatrix,
  explainedVariance,
  f1score,
  falsePositiveRate,
  mae,
  mse,
  precision,
  recall,
  rmse,
  rsquared,
  type
};

interface ILabelPlus extends ILabel {
  order: number;
}

const f: ILabelPlus = { code: 'F', label: 'F', order: 3 };
const meansq: ILabelPlus = { code: 'mean_sq', label: 'mean-sq', order: 2 };
const prf: ILabelPlus = { code: 'PR(>F)', label: 'PR(>F)', order: 4 };
const sumsq: ILabelPlus = { code: 'sum_sq', label: 'sum-sq', order: 1 };
const df: ILabelPlus = { code: 'df', label: 'df', order: 0 };

const coef: ILabelPlus = { code: 'coef', label: 'coef', order: 0 };
const pvalues: ILabelPlus = { code: 'p_values', label: 'p-value', order: 3 };
const stderr: ILabelPlus = {
  code: 'std_err',
  label: 'std-err',
  order: 2
};
const tvalues: ILabelPlus = { code: 't_values', label: 't-value', order: 2 };

export const globalParameters = {
  kfold: {
    k: 3
  }
};

export const LABELS: ILabelPlus[] = [
  coef,
  df,
  f,
  meansq,
  prf,
  pvalues,
  stderr,
  sumsq,
  tvalues
];
