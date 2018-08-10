export interface IExperimentResult {
  uuid: string;
  name: string;
  createdBy: any;
  model: any;
  created: string;
  finished: string;
  hasError: boolean;
  hasServerError: boolean;
  shared: boolean;
  resultsViewed: boolean;
  algorithms: any;
  validations: any;
  result: IResultEntity[];
}

export interface IResultEntity {
  timestamp: number;
  data: any;
  algorithmSpec: any;
  algorithm: string;
  jobId: string;
  node: string;
  type: string;
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

export interface IExperimentsContainer {
  error?: string;
  experiments?: IExperimentResult[];
  loading: boolean;
}

export interface IExperimentContainer {
  error?: string;
  experiment?: IExperimentResult;
  loading: boolean;
}

export interface IModelContainer {
  error?: string;
  model?: IModelResult;
  loading: boolean;
}
