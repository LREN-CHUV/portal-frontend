
export interface IConfusionMatrix {
  labels : string[],
  values: number[][]
}

export interface IValidationScore {
  recall: number,
  precision: number,
  f1score: number,
  falsePositiveRate: number,
  accuracy: number,
  weighted?: boolean,
  confusionMatrix?: IConfusionMatrix,
  node: string
}

export interface IKfoldValidationScore {
  explainedVariance: number,
  mae: number,
  mse: number,
  rsquared: number,
  rmse: number,
  type: string
}

export interface IPolynomialClassificationScore extends IValidationScore {

}

export interface IMethod {
  algorithm: string,
  predictive?: boolean,
  mime: string,
  data?: any[],
  error?: string,
  // Details for the validation of a method on a single node, includes for example the folds when k-fold cross-validation is used
  crossValidation?: IKfoldValidationScore | IValidationScore | IPolynomialClassificationScore
  remoteValidation?: INode | IValidationScore
}
export interface INode {
  name: string,
  methods: IMethod[],
  // Validation of all predictive methods, ranked by descending order of performance
  rankedCrossValidations?: IValidationScore[]
}

export interface User {
  fullname?: string;
  username: string;
}

export interface IExperimentResult {
  created: Date,
  error?: string,
  name: string,
  resultsViewed: boolean,
  uuid: string,
  modelDefinitionId: string,
  results?: INode[],
  user: User;
  algorithms: Algorithm[];
  modelDefinition?: Query;
  validations?: any
}

export interface VariableEntity {
  code: string;
  type?: string;
  sqlType?: string;
  description?: string;
}

export interface Algorithm {
  code: string;
  name: string;
  parameters: any;
  validation: boolean;
}

export interface Query {
  filters: string;
  variables?: VariableEntity[];
  coVariables?: VariableEntity[];
  groupings?: VariableEntity[];
  trainingDatasets?: VariableEntity[];
  testingDatasets?: VariableEntity[];
  validationDatasets?: VariableEntity[];
}

export interface IModelResult extends IErrorResult{
  slug: string;
  title: string;
  valid: boolean;
  createdAt: number;
  query: Query;
  dataset: any;
  config: any;
  createdBy: any;
}

export interface IMethodDefinition {
  description?: string;
  label?: string;
  code: string;
}

export interface IMethodResult extends IErrorResult {
  methods: any
}

export interface IErrorResult {
  error?: string
}

export interface IExperimentListContainer extends IErrorResult {
  experiments?: IExperimentResult[];
  loading: boolean;
}

export interface IExperimentContainer extends IErrorResult {
  experiment?: IExperimentResult;
}

export interface IModelContainer extends IErrorResult {
  model?: IModelResult;
  models?: IModelResult[]
}

export interface IMethodContainer extends IErrorResult {
  methods?: IMethodResult[];
}
