import { type } from "os";

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

export const LONGITUDINAL_DATASET_TYPE = 'longitudinal';
export const HISTOGRAMS_STORAGE_KEY = 'mipChoosenHistogramsVars';
export const PRIVACY_ERROR = 'NOT ENOUGH DATA';
export const FORBIDDEN_ACCESS_MESSAGE =
  'Connection SUCCESSFUL! Despite of this, it appears that you currently don&lsquo;t have enough privileges to browse this platform. Please contact the  <a href="mailto:support@ebrains.eu?subject=Medical%20Informatics%20Platform%20Access%20Request">Support Team</a> (support@ebrains.eu) if you think you should have <a href="https://mip.ebrains.eu/access" target="_blank">access</a>.';

export const ERRORS_OUTPUT = [
  MIME_TYPES.ERROR,
  MIME_TYPES.WARNING,
  MIME_TYPES.USER_WARNING
];


interface AlgorithmOutput {
  enabled: boolean;
  name?: string;
  types: MIME_TYPES[];
  label?: string;
}

export const ALGORITHMS_OUTPUT: AlgorithmOutput[] = [
  {
    enabled: true,
    name: 'ANOVA',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'LINEAR_REGRESSION',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'LOGISTIC_REGRESSION',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'TTEST_INDEPENDENT',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'TTEST_PAIRED',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'PEARSON_CORRELATION',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'ID3',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.JSON]
  },
  {
    enabled: true,
    name: 'KMEANS',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'NAIVE_BAYES_TRAINING',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'TTEST_ONESAMPLE',
    types: [MIME_TYPES.JSONDATA]
  },
  {
    enabled: false,
    name: 'MULTIPLE_HISTOGRAMS',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'PCA',
    types: [MIME_TYPES.JSONDATA, MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Hold Out Validation',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    label: 'Naive Bayes with Cross Validation',
    types: [MIME_TYPES.HIGHCHARTS, MIME_TYPES.JSONDATA]
  },
  {
    enabled: true,
    name: 'CALIBRATION_BELT',
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'CART',
    types: [MIME_TYPES.JSON]
  },
  {
    enabled: true,
    name: 'KAPLAN_MEIER',
    // TODO: longitudinal datasets should be tagged
    types: [MIME_TYPES.HIGHCHARTS]
  },
  {
    enabled: true,
    name: 'THREE_C',
    types: [MIME_TYPES.JSONDATA]
  }
].map(a => ({ ...a, types: [...ERRORS_OUTPUT, ...a.types] }));

const independents = ['X', 'column1', 'x', 'descriptive_attributes', 'CM'];
const dependents = [
  'Y',
  'column2',
  'y',
  'target_attributes',
  'Event variable',
  'PB'
];
export const UI_HIDDEN_PARAMETERS = [
  ...dependents,
  ...independents,
  'dataset',
  'filter',
  'pathology',
  'centers',
  'formula'
];

export const ONTOLOGY_URL = 'https://rohan.scai.fraunhofer.de/ols/index';

export const MIN_SEARCH_CHARACTER_NUMBER = 2; //
