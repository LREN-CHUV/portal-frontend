// Mime types
export enum MIME_TYPES {
  ERROR = 'text/plain+error',
  WARNING = 'text/plain+warning',
  USER_WARNING = 'text/plain+user_error',
  HIGHCHARTS = 'application/vnd.highcharts+json',
  JSON = 'application/json',
  MIP_PFA = 'application/vnd.hbp.mip.experiment.pfa+json',
  MIP_COMPOUND = 'application/vnd.hbp.mip.compound+json',
  PFA = 'application/pfa+json',
  PLOTLY = 'application/vnd.plotly.v1+json',
  JSONDATA = 'application/vnd.dataresource+json',
  HTML = 'text/html',
  TEXT = 'text/plain',
  JSONRAW = 'application/raw+json'
}

const DEFAULT_OUTPUT = [
  MIME_TYPES.ERROR,
  MIME_TYPES.WARNING,
  MIME_TYPES.USER_WARNING
];

// TODO: merge OUTPUT and ENABLED
export const ALGORITHM_DEFAULT_OUTPUT = [
  {
    name: 'ANOVA',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    name: 'LINEAR_REGRESSION',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    name: 'LOGISTIC_REGRESSION',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    name: 'HISTOGRAMS',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    name: 'TTEST_INDEPENDENT',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    name: 'TTEST_PAIRED',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    name: 'PEARSON_CORRELATION',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    name: 'ID3',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.JSON]
  },
  {
    name: 'KMEANS',
    types: [...DEFAULT_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  }
];

export const ENABLED_ALGORITHMS = [
  'LOGISTIC_REGRESSION',
  'ANOVA',
  // 'NAIVE_BAYES_TRAINING_STANDALONE',
  'KMEANS',
  'PEARSON_CORRELATION',
  'ID3',
  // 'HISTOGRAMS',
  'LINEAR_REGRESSION',
  'TTEST_INDEPENDENT'
  // 'TTEST_PAIRED',
  // 'TTEST_ONESAMPLE'
];

const independents = ['X', 'column1', 'x', 'descriptive_attributes'];
const dependents = ['Y', 'column2', 'y', 'target_attributes'];
export const UI_HIDDEN_PARAMETERS = [
  ...dependents,
  ...independents,
  'dataset',
  'filter',
  'pathology'
];
