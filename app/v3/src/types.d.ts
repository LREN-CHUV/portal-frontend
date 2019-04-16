import { Variable, VariableEntity } from './components/API/Core';
import { MiningResponseShape } from './components/API/Mining';

export declare namespace MIP {
  export interface IError {
    error?: string;
  }
}

export declare namespace MIP.Store {
  export interface ICoreState extends IError {
    hierarchy?: any;
    variables?: VariableEntity[];
    datasets?: VariableEntity[];
    methods?: MIP.API.IMethods;
  }

  export interface IExperimentState extends IError {
    experiment?: MIP.API.IExperimentResponse;
    experiments?: MIP.API.IExperimentResponse[];
  }

  export interface IMiningState extends IError {
    summaryStatistics?: MiningResponseShape[];
    heatmaps?: MiningResponseShape[];
    histograms?: MiningResponseShape;
  }

  export interface IModelState extends IError {
    model?: MIP.API.IModelResponse | MIP.Internal.IModelMock;
    models?: MIP.API.IModelResponse[];
  }
}

export declare namespace MIP.API {
  export interface IExperimentResponse {
    created: Date;
    error?: string;
    name: string;
    resultsViewed: boolean;
    uuid: string;
    modelDefinitionId: string;
    results?: INode[];
    user?: MIP.API.IUser;
    algorithms: MIP.API.IMethod[];
    modelDefinition?: MIP.API.IQuery;
    validations?: any;
    shared: boolean;
  }

  export interface IExperimentPayload {
    algorithms: [MIP.API.IMethod];
    model: string;
    name: string;
    validations: any;
  }

  export interface IMiningResponse {
    jobId: string;
    node: string;
    function: string;
    shape: string;
    timestamp: string;
    data: any;
  }

  export interface IMiningPayload {
    algorithm?: MIP.API.IMethod;
    variables: VariableEntity[];
    grouping?: VariableEntity[];
    covariables?: VariableEntity[];
    datasets: VariableEntity[];
    filters: string;
  }

  export interface IModelResponse extends IError {
    slug?: string;
    title: string;
    valid?: boolean;
    createdAt?: number;
    query: MIP.API.IQuery;
    dataset?: any; // FIXME: not used in api
    config?: any; // FIXME: not used in api
    createdBy?: IUser;
    isMock?: boolean;
  }

  export interface IMethod {
    code: string;
    name: string;
    parameters?: [IMethodPayload] | any;
    validation: boolean;
    constraints?: any;
    type?: string[];
  }

  export interface IMethods {
    algorithms: IMethod[];
  }

  export interface IMethodPayload {
    code: string;
    constraints: any;
    default_value: any;
    value: any;
    values?: any;
    description: string;
    label: string;
    type: string;
  }

  export interface INode {
    name: string;
    methods: MIP.API.IMethod[];
    // Validation of all predictive methods, ranked by descending order of performance
    rankedCrossValidations?: IValidationScore[];
  }

  export interface IQuery {
    filters: string;
    variables?: VariableEntity[];
    coVariables?: VariableEntity[];
    groupings?: VariableEntity[];
    trainingDatasets?: VariableEntity[];
    testingDatasets?: VariableEntity[];
    validationDatasets?: VariableEntity[];
    [key: string]: any;
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
    [key: string]: any;
  }

  export interface IKfoldValidationScore {
    explainedVariance: number;
    mae: number;
    mse: number;
    rsquared: number;
    rmse: number;
    type: string;
    [key: string]: any;
  }

  export interface IPolynomialClassificationScore extends IValidationScore {}
}

export declare namespace MIP.Internal {
  // export enum IVariableType {
  //   Integer,
  //   Real,
  //   Binominal,
  //   Polynominal
  // }
  export interface IQuery extends MIP.API.IQuery {
    filtersFromParams?: any[];
  }

  export interface IModelMock extends MIP.API.IModelResponse {
    query: MIP.Internal.IQuery;
    isMock: boolean;
  }
}
