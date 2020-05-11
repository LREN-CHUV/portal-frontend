// Mime types
export enum MIME_TYPES {
  ERROR = 'text/plain+error',
  WARNING = 'text/plain+warning',
  USER_WARNING = 'text/plain+user_error',
  HIGHCHARTS = 'application/vnd.highcharts+json',
  JSON = 'application/json',
  JSONBTREE = 'application/binary-tree+json',
  PFA = 'application/pfa+json',
  JSONDATA = 'application/vnd.dataresource+json',
  HTML = 'text/html',
  TEXT = 'text/plain'
}

export const LONGITUDINAL_DATASET_TYPE = 'alzheimer_fake_cohort';

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
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Linear Regression',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Logistic Regression',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: false,
    label: 'Histograms',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'T-Test Independent',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'T-Test Paired',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    label: 'Pearson Correlation',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'ID3',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.JSON]
  },
  {
    enabled: true,
    label: 'k-Means Clustering',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes Training',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'T-Test One-Sample ',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: false,
    label: 'Multiple Histograms',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Principal Components analysis',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Workflow Naive Bayes with Hold Out Validation',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Cross Validation',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Calibration Belt',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'CART',
    types: [MIME_TYPES.JSON]
  },
  {
    enabled: true,
    label: 'Kaplan-Meier Estimator',
    datasetType: LONGITUDINAL_DATASET_TYPE,
    types: [MIME_TYPES.HIGHCHARTS]
  }
].map(a => ({ ...a, types: [...ERRORS_OUTPUT, ...a.types] }));

const independents = ['X', 'column1', 'x', 'descriptive_attributes'];
const dependents = ['Y', 'column2', 'y', 'target_attributes', 'Event variable'];
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
  'bnabroadcategory',
  'amyloid42_status',
  'p_tau_status',
  'dataset'
];

export const ONTOLOGY_URL = 'https://rohan.scai.fraunhofer.de/ols/index';
