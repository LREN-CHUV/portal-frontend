export interface IExperimentParameters {
  algorithms: [IAlgorithm];
  model: string;
  name: string;
  validations: any;
}

export interface ICoreDataContainer {
  error?: string;
  hierarchy?: any;
  variables?: IVariableEntity[];
  datasets?: IVariableEntity[];
  methods?: IMethods;
}
export interface IConfusionMatrix {
  labels: string[];
  values: number[][];
}

export interface IValidationScore {
  recall: number;
  precision: number;
  f1score: number;
  falsePositiveRate: number;
  accuracy: number;
  weighted?: boolean;
  confusionMatrix?: IConfusionMatrix;
  node: string;
}

export interface IKfoldValidationScore {
  explainedVariance: number;
  mae: number;
  mse: number;
  rsquared: number;
  rmse: number;
  type: string;
}

export interface IPolynomialClassificationScore extends IValidationScore {}

export interface IMethod {
  algorithm: string;
  predictive?: boolean;
  mime: string;
  data?: any[];
  error?: string;
  parameters?: any;
  // Details for the validation of a method on a single node, includes for example the folds when k-fold cross-validation is used
  crossValidation?:
    | IKfoldValidationScore
    | IValidationScore
    | IPolynomialClassificationScore;
  remoteValidation?: INode | IValidationScore;
}
export interface INode {
  name: string;
  methods: IMethod[];
  // Validation of all predictive methods, ranked by descending order of performance
  rankedCrossValidations?: IValidationScore[];
}

export interface IExperimentResult {
  created: Date;
  error?: string;
  name: string;
  resultsViewed: boolean;
  uuid: string;
  modelDefinitionId: string;
  results?: INode[];
  user: IUser;
  algorithms: IAlgorithm[];
  modelDefinition?: IQuery;
  validations?: any;
  shared: boolean;
}

export interface IVariableEntity {
  code: string;
  type?: string;
  sqlType?: string;
  description?: string;
}

export interface IMethods {
  algorithms: IAlgorithm[];
}

export interface IAlgorithmParameter {
  code: string;
  constraints: any;
  default_value: any;
  value: any;
  description: string;
  label: string;
  type: string;
}

export interface IAlgorithm {
  code: string;
  name: string;
  parameters: [IAlgorithmParameter] | [];
  validation: boolean;
  constraints?: any;
  type?: [string]
}

export interface IQuery {
  filters: string;
  variables?: IVariableEntity[];
  coVariables?: IVariableEntity[];
  groupings?: IVariableEntity[];
  trainingDatasets?: IVariableEntity[];
  testingDatasets?: IVariableEntity[];
  validationDatasets?: IVariableEntity[];
}

export interface IMethodDefinition {
  description?: string;
  label?: string;
  code: string;
}

export interface IMethodResult extends IErrorResult {
  methods: any;
}

export interface IErrorResult {
  error?: string;
}

export interface IExperiment extends IErrorResult {
  experiment?: IExperimentResult;
  experiments?: IExperimentResult[];
}

export interface IUser {
  agreeNDA?: boolean;
  fullname: string;
  languages?: string[];
  picture?: string;
  roles?: string[];
  username: string;
  votedApps?: string[];
}

export interface IModelResult extends IErrorResult {
  slug: string;
  title: string;
  valid: boolean;
  createdAt: number;
  query: IQuery;
  dataset: any; // FIXME: not used in api
  config: any; // FIXME: not used in api
  createdBy: IUser;
}

export interface IModel extends IErrorResult {
  model?: IModelResult;
  models?: IModelResult[];
}
