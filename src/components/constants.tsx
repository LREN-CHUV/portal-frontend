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

export const HISTOGRAMS_STORAGE_KEY = 'mipChoosenHistogramsVars';

export const ERRORS_OUTPUT = [
  MIME_TYPES.ERROR,
  MIME_TYPES.WARNING,
  MIME_TYPES.USER_WARNING
];

export const ENABLED_ALGORITHMS = [
  {
    enabled: true,
    label: 'ANOVA',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Linear Regression',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Logistic Regression',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: false,
    label: 'Histograms',
    types: [...ERRORS_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'T-Test Independent',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'T-Test Paired',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Pearson Correlation',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'ID3',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.JSON]
  },
  {
    enabled: true,
    label: 'k-Means Clustering',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes Training',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'T-Test One-Sample ',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA]
  },
  {
    enabled: false,
    label: 'Multiple Histograms',
    types: [...ERRORS_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Principal Components analysis',
    types: [...ERRORS_OUTPUT, MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Workflow Naive Bayes with Hold Out Validation',
    types: [...ERRORS_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Cross Validation',
    types: [...ERRORS_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Calibration Belt',
    types: [...ERRORS_OUTPUT, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: false,
    label: 'CART',
    types: [...ERRORS_OUTPUT]
  }
];

const independents = ['X', 'column1', 'x', 'descriptive_attributes'];
const dependents = ['Y', 'column2', 'y', 'target_attributes'];
export const UI_HIDDEN_PARAMETERS = [
  ...dependents,
  ...independents,
  'dataset',
  'filter',
  'pathology',
  'centers',
  'formula'
];

// backward compatibility
export const variablesFilter = [
  'subjectageyears',
  'gender',
  'DIAG_etiology_1',
  'DIAG_stade',
  'bnabroadcategory'
];
