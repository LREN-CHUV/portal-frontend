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
    result: any[];
  }

  export interface IExperimentContainer {
    error?: string;
    experiment?: IExperimentResult;
    loading: boolean;
  }
