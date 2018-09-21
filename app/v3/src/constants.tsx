// Mime types
export enum MIME_TYPES {
  ERROR = 'text/plain+error',
  HIGHCHARTS = 'application/vnd.highcharts+json',
  JSON = 'application/json',
  MIP_PFA = 'application/vnd.hbp.mip.experiment.pfa+json',
  PFA = 'application/pfa+json',
  PLOTLY = 'application/vnd.plotly.v1+json',
  VISJS = 'application/vnd.visjs+javascript',
  JSONDATA = 'application/vnd.dataresource+json',
  HTML = 'text/html',
  TEXT = 'text/plain',
}

interface ILabel {
  code: string;
  label: string;
}

// regression && classification scores labels
const accuracy: ILabel = { code: 'Accuracy', label: 'Accuracy' };
const f1score: ILabel = {
  code: 'Weighted F1-score',
  label: 'Weighted F1-score',
};
const falsePositiveRate: ILabel = {
  code: 'Weighted false positive rate',
  label: 'Weighted false positive rate',
};
const precision: ILabel = {
  code: 'Weighted precision',
  label: 'Weighted precision',
};
const recall: ILabel = { code: 'Weighted recall', label: 'Weighted recall' };
const confusionMatrix: ILabel = {
  code: 'Confusion matrix',
  label: 'Confusion matrix',
};

const explainedVariance: ILabel = {
  code: 'Explained variance',
  label: 'Explained variance',
};
const mae: ILabel = { code: 'MAE', label: 'Mean absolute error' };
const mse: ILabel = { code: 'MSE', label: 'Mean square error' };
const rsquared: ILabel = {
  code: 'R-squared',
  label: 'Coefficient of determination (R²)',
};
const rmse: ILabel = { code: 'RMSE', label: 'Root mean square error' };
const type: ILabel = { code: 'type', label: 'Explained variance' };

export const SCORES = {
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
  type,
};

interface ILabelPlus extends ILabel {
  order: number;
}

const f: ILabelPlus = { code: 'F', label: 'F-value', order: 2 };
const meansq: ILabelPlus = { code: 'mean_sq', label: '', order: -1 };
const prf: ILabelPlus = { code: 'PR(>F)', label: 'P-value', order: 3 };
const sumsq: ILabelPlus = { code: 'sum_sq', label: 'Sum²', order: 0 };
const df: ILabelPlus = { code: 'df', label: 'Degrees of freedom', order: 1 };

const coef: ILabelPlus = { code: 'coef', label: 'Coefficient', order: 0 };
const pvalues: ILabelPlus = { code: 'p_values', label: 'P-value', order: 3 };
const stderr: ILabelPlus = {
  code: 'std_err',
  label: 'Standard Error',
  order: 2,
};
const tvalues: ILabelPlus = { code: 't_values', label: 'T-value', order: 2 };

export const LABELS: ILabelPlus[] = [
  coef,
  df,
  f,
  meansq,
  prf,
  pvalues,
  stderr,
  sumsq,
  tvalues,
];
