interface IPfa {
  crossValidation?: IRegressionScore | IPolynomialClassificationScore;
  data?: any;
  remoteValidation?: INode | IRegressionScore | IPolynomialClassificationScore;
  error?: any;
}

export interface IConfusionMatrix {
  labels: string[];
  values: number[][];
}

export interface IPolynomialClassificationScore {
  recall: number;
  precision: number;
  f1score: number;
  falsePositiveRate: number;
  accuracy: number;
  weighted?: boolean;
  confusionMatrix?: IConfusionMatrix;
}

export interface IRegressionScore {
  explainedVariance: number;
  mae: number;
  mse: number;
  rsquared: number;
  rmse: number;
}

export interface IValidationScore extends IPolynomialClassificationScore {}

export interface IMethod {
  algorithm: string;
  predictive?: boolean;
  mime: string;
  data?: any[];
  error?: string;
  // Details for the validation of a method on a single node, includes for example the folds when k-fold cross-validation is used
  crossValidation?: IRegressionScore | IPolynomialClassificationScore;
  remoteValidation?: INode | IRegressionScore | IPolynomialClassificationScore;
}
export interface INode {
  name: string;
  methods: IMethod[];
  // Validation of all predictive methods, ranked by descending order of performance
  rankedCrossValidations?: IValidationScore[];
}

export interface User {
  fullname?: string;
  username: string;
}

export interface IExperimentResult {
  created: Date;
  error?: string;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelDefinitionId: string;
  result?: INode[];
  user: User;
  algorithms: string[];
}

export interface CodeEntity {
  code: string;
}
export interface Query {
  filters: string;
  variables?: CodeEntity[] | null;
  coVariables?: CodeEntity[] | null;
  groupings?: CodeEntity[] | null;
  trainingDatasets?: CodeEntity[] | null;
  testingDatasets?: CodeEntity[] | null;
  validationDatasets?: CodeEntity[] | null;
}

export interface IModelResult {
  slug: string;
  title: string;
  valid: boolean;
  createdAt: number;
  query: Query;
  dataset: any;
  config: any;
  createdBy: any;
}

export interface IExperimentListContainer {
  error?: string;
  experiments?: IExperimentResult[];
  loading: boolean;
}

export interface IExperimentContainer {
  error?: string;
  experiment?: IExperimentResult;
}

export interface IModelContainer {
  error?: string;
  model?: IModelResult;
  loading: boolean;
}
