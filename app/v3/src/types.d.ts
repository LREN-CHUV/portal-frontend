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
    experiment?: MIP.API.IExperimentResult;
    experiments?: MIP.API.IExperimentResult[];
  }

  export interface IModelState extends IError {
    model?: MIP.API.IModelResult;
    models?: MIP.API.IModelResult[];
  }
}

export declare namespace MIP.API {
  export interface IExperimentResult {
    created: Date;
    error?: string;
    name: string;
    resultsViewed: boolean;
    uuid: string;
    modelDefinitionId: string;
    results?: INode[];
    user: MIP.API.IUser;
    algorithms: MIP.API.IMethod[];
    modelDefinition?: MIP.API.IQuery;
    validations?: any;
    shared: boolean;
  }

  export interface IExperimentParameters {
    algorithms: [MIP.API.IMethod];
    model: string;
    name: string;
    validations: any;
  }

  export interface IModelResult extends IError {
    slug: string;
    title: string;
    valid: boolean;
    createdAt: number;
    query: MIP.API.IQuery;
    dataset: any; // FIXME: not used in api
    config: any; // FIXME: not used in api
    createdBy: IUser;
  }

  export interface IMethod {
    code: string;
    name: string;
    parameters?: [IMethodParameter] | any;
    validation: boolean;
    constraints?: any;
    type?: [string];
  }

  // export interface IMethod {
  //   algorithm: string;
  //   predictive?: boolean;
  //   mime: string;
  //   data?: any[];
  //   error?: string;
  //   parameters?: any;
  //   // Details for the validation of a method on a single node, includes for example the folds when k-fold cross-validation is used
  //   crossValidation?:
  //     | IKfoldValidationScore
  //     | IValidationScore
  //     | IPolynomialClassificationScore;
  //   remoteValidation?: INode | IValidationScore;
  // }

  export interface IMethods {
    algorithms: IMethod[];
  }

  export interface IMethodParameter {
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
  }

  export interface IVariableEntity {
    code: string;
    type?: string;
    sqlType?: string;
    description?: string;
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
}
