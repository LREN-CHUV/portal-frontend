export declare namespace MIP {
  export interface IError {
    error?: string;
  }
}

export declare namespace MIP.Store {
  export interface ICoreState extends IError {
    hierarchy?: any;
    variables?: MIP.API.IVariableEntity[];
    datasets?: MIP.API.IVariableEntity[];
    methods?: MIP.API.IMethods;
  }

  export interface IExperimentState extends IError {
    experiment?: MIP.API.IExperimentResponse;
    experiments?: MIP.API.IExperimentResponse[];
  }

  export interface IMiningResponseShape {
    data?: any;
    error?: string;
    dataset?: MIP.API.IVariableEntity;
  }

  export interface IMiningState extends IError {
    minings?: MIP.Store.IMiningResponseShape[];
    heatmaps?: MIP.Store.IMiningResponseShape[];
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
    variables: IVariableEntity[];
    grouping?: IVariableEntity[];
    covariables?: IVariableEntity[];
    datasets: IVariableEntity[];
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
    variables?: MIP.API.IVariableEntity[];
    coVariables?: MIP.API.IVariableEntity[];
    groupings?: MIP.API.IVariableEntity[];
    trainingDatasets?: MIP.API.IVariableEntity[];
    testingDatasets?: MIP.API.IVariableEntity[];
    validationDatasets?: MIP.API.IVariableEntity[];
    [key: string]: any;
  }

  export interface IVariable {
    code: string;
    label?: string;
  }

  export interface IVariableEntity extends IVariable {
    type?: string;
    sqlType?: string;
    description?: string;
    enumerations?: IVariable[];
    group?: IVariable[];
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
  export interface IQuery extends MIP.API.IQuery {
    filtersFromParams?: any[];
  }

  export interface IModelMock extends MIP.API.IModelResponse {
    query: MIP.Internal.IQuery;
    isMock: boolean;
  }
}
